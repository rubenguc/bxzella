import mongoose from "mongoose";
import {
  createOrUpdateAccountSync,
  getAccountSync,
} from "@/features/account-sync/server/db/account-sync-db";
import { getAccountByUID } from "@/features/accounts/server/db/accounts-db";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import {
  getFilledOrders,
  getPositionHistory,
} from "@/features/providers/bingx/bingx-api";
import type { PlaybookRulesCompletionResponse } from "@/features/trades/interfaces/playbook-rules-completion-interface";
import type {
  FetchPositionHistoryForSymbolsProps,
  GetPaginatedTradesByPlaybook,
  GetPaginatedTradesByPlaybookReponse,
  GetPlaybookRulesCompletionByPlaybookId,
  GetTradesByAccountUID,
  GetTradesByAccountUIDResponse,
  GetTradesStatisticProps,
  Trade,
  TradePlaybook,
  TradeStatisticsResult,
} from "@/features/trades/interfaces/trades-interfaces";
import { TradeModel } from "@/features/trades/model/trades-model";
import {
  getSyncTimeRange,
  processFilledOrders,
} from "@/features/trades/utils/trades-utils";
import type { Coin } from "@/interfaces/global-interfaces";
import { getPaginatedData } from "@/utils/db-utils";

async function fetchPositionHistoryForSymbols({
  apiKey,
  secretKey,
  symbols,
  timeRange,
  uid,
  coin = "USDT",
}: FetchPositionHistoryForSymbolsProps): Promise<Trade[]> {
  const batchSize = 5;
  const batches = [];
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }

  const allPositionHistories: Trade[] = [];
  for (const [index, batch] of batches.entries()) {
    const batchResults = await Promise.all(
      batch.map((symbol) =>
        getPositionHistory(
          apiKey,
          secretKey,
          {
            symbol,
            startTs: timeRange.startTs,
            endTs: timeRange.endTs,
          },
          coin,
        )
          .then((r) =>
            r.data.positionHistory.map((ph) => ({
              ...ph,
              openTime: new Date(ph.openTime),
              updateTime: new Date(ph.updateTime),
              accountUID: uid,
              coin,
              type: "P",
            })),
          )
          .catch((error) => {
            console.error(
              `Error fetching position history for symbol ${symbol}:`,
              error,
            );
            return [];
          }),
      ),
    );

    allPositionHistories.push(
      ...(batchResults.flatMap(
        (symbolPositions) => symbolPositions,
      ) as Trade[]),
    );

    if (index < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return allPositionHistories;
}

export async function syncPositions(
  uid: string,
  coin: Coin = "USDT",
): Promise<boolean> {
  console.log(`syncing positions for: ${uid}...`);

  const uidSyncConfig = await getAccountSync(uid, coin);

  const timeRange = getSyncTimeRange(uidSyncConfig?.perpetualLastSyncTime);

  const account = await getAccountByUID(uid);
  if (!account) return false;

  const { decriptedApiKey, decryptedSecretKey } =
    getDecryptedAccountCredentials(account);

  const filledOrders = await getFilledOrders(
    decriptedApiKey,
    decryptedSecretKey,
    timeRange,
    coin,
  );

  const symbolsToFetch = processFilledOrders(filledOrders);

  if (symbolsToFetch.length === 0) return false;

  const allPositionHistories = await fetchPositionHistoryForSymbols({
    apiKey: decriptedApiKey,
    secretKey: decryptedSecretKey,
    symbols: symbolsToFetch,
    timeRange,
    uid,
    coin,
  });

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await createOrUpdateAccountSync(uid, timeRange.endTs, coin, session);
      await saveMultipleTrades(allPositionHistories, session);
    });
  } finally {
    session.endSession();
  }
  console.log("positions synced");
  return true;
}

export async function saveMultipleTrades(
  trades: Trade[],
  session: mongoose.ClientSession,
) {
  await TradeModel.bulkWrite(
    trades.map((trade) => ({
      updateOne: {
        filter: { accountUID: trade.accountUID, positionId: trade.positionId },
        update: { $set: trade },
        upsert: true,
      },
    })),
    { session },
  );
}

export async function getTradesByAccountUID({
  accountUID,
  page,
  limit,
  coin = "USDT",
  startDate,
  endDate,
}: GetTradesByAccountUID): GetTradesByAccountUIDResponse {
  const find: Record<string, any> = {
    accountUID,
    coin,
  };

  if (startDate && endDate) {
    find.openTime = { $gte: startDate, $lte: endDate };
    find.updateTime = { $gte: startDate, $lte: endDate };
  }

  return await getPaginatedData(TradeModel, find, { page, limit });
}

export function getTradesStatistic({
  accountUID,
  startDate,
  endDate,
  coin = "USDT",
}: GetTradesStatisticProps): Promise<TradeStatisticsResult> {
  return TradeModel.aggregate([
    {
      $match: {
        accountUID,
        coin,
        closeAllPositions: true,
        openTime: { $gte: startDate, $lte: endDate },
        updateTime: { $gte: startDate, $lte: endDate },
      },
    },

    {
      $addFields: {
        numericNetProfit: {
          $convert: {
            input: "$netProfit",
            to: "double",
            onError: 0,
          },
        },
      },
    },

    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        totalWin: {
          $sum: {
            $cond: [{ $gt: ["$numericNetProfit", 0] }, 1, 0],
          },
        },
        totalLoss: {
          $sum: {
            $cond: [{ $lt: ["$numericNetProfit", 0] }, 1, 0],
          },
        },
        sumWin: {
          $sum: {
            $cond: [{ $gt: ["$numericNetProfit", 0] }, "$numericNetProfit", 0],
          },
        },
        sumLoss: {
          $sum: {
            $cond: [{ $lt: ["$numericNetProfit", 0] }, "$numericNetProfit", 0],
          },
        },
        netPnL: { $sum: "$numericNetProfit" },
      },
    },

    {
      $project: {
        profitFactor: {
          value: {
            $cond: [
              { $eq: [{ $abs: "$sumLoss" }, 0] },
              "$sumWin",
              {
                $divide: ["$sumWin", { $abs: "$sumLoss" }],
              },
            ],
          },
          sumWin: "$sumWin",
          sumLoss: { $abs: "$sumLoss" },
        },
        tradeWin: {
          value: {
            $multiply: [
              {
                $divide: [
                  "$totalWin",
                  { $cond: [{ $eq: ["$totalTrades", 0] }, 1, "$totalTrades"] },
                ],
              },
              100,
            ],
          },
          totalWin: "$totalWin",
          totalLoss: "$totalLoss",
        },
        avgWinLoss: {
          value: {
            $cond: [
              {
                $and: [{ $ne: ["$totalWin", 0] }, { $ne: ["$totalLoss", 0] }],
              },
              {
                $divide: [
                  { $divide: ["$sumWin", "$totalWin"] },
                  {
                    $divide: [{ $abs: "$sumLoss" }, "$totalLoss"],
                  },
                ],
              },
              0,
            ],
          },
          avgWin: {
            $cond: [
              { $eq: ["$totalWin", 0] },
              0,
              { $divide: ["$sumWin", "$totalWin"] },
            ],
          },
          avgLoss: {
            $cond: [
              { $eq: ["$totalLoss", 0] },
              0,
              {
                $divide: [{ $abs: "$sumLoss" }, "$totalLoss"],
              },
            ],
          },
        },
        netPnL: {
          value: "$netPnL",
          totalTrades: "$totalTrades",
        },
      },
    },
  ]) as unknown as Promise<TradeStatisticsResult>;
}

export function getTradeProfitByDays({
  accountUID,
  startDate,
  endDate,
  coin = "USDT",
}: {
  accountUID: string;
  startDate: Date;
  endDate: Date;
  coin?: Coin;
}) {
  return TradeModel.aggregate([
    {
      $match: {
        accountUID,
        coin,
        closeAllPositions: true,
        updateTime: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updateTime" },
        },
        netProfit: {
          $sum: {
            $convert: {
              input: "$netProfit",
              to: "double",
              onError: 0,
            },
          },
        },
        trades: { $push: "$$ROOT" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
}

export async function updateTradePlaybook(
  tradeId: string,
  tradePlaybook: TradePlaybook,
) {
  return await TradeModel.updateOne(
    { _id: tradeId },
    { playbook: tradePlaybook },
  );
}

export async function getPaginatedTradesByPlaybook({
  accountUID,
  startDate,
  endDate,
  coin = "USDT",
  playbookId,
  page = 1,
  limit = 10,
}: GetPaginatedTradesByPlaybook): GetPaginatedTradesByPlaybookReponse {
  const findCriteria: Record<string, unknown> = {
    accountUID,
    coin,
    "playbook.id": playbookId,
  };

  if (startDate && endDate) {
    findCriteria.openTime = { $gte: startDate, $lte: endDate };
    findCriteria.updateTime = { $gte: startDate, $lte: endDate };
  }

  return await getPaginatedData(TradeModel, findCriteria, {
    page,
    limit,
    sortBy: {
      updateTime: -1,
    },
  });
}

export async function getPlaybookRulesCompletionByPlaybookId({
  playbookId,
  accountUID,
  startDate,
  endDate,
  coin = "USDT",
}: GetPlaybookRulesCompletionByPlaybookId): Promise<PlaybookRulesCompletionResponse> {
  const rulesCompletion = await TradeModel.aggregate([
    {
      $match: {
        accountUID,
        coin,
        closeAllPositions: true,
        openTime: { $gte: startDate, $lte: endDate },
        updateTime: { $gte: startDate, $lte: endDate },
        "playbook.id": new mongoose.Types.ObjectId(playbookId),
      },
    },
    {
      $unwind: "$playbook.rulesProgress",
    },
    {
      $unwind: "$playbook.rulesProgress.rules",
    },
    {
      $group: {
        _id: {
          groupName: "$playbook.rulesProgress.groupName",
          ruleName: "$playbook.rulesProgress.rules.name",
        },
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: ["$playbook.rulesProgress.rules.isCompleted", 1, 0],
          },
        },
      },
    },
    {
      $project: {
        groupName: "$_id.groupName",
        ruleName: "$_id.ruleName",
        completionPercentage: {
          $cond: [
            { $eq: ["$total", 0] },
            0,
            { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
          ],
        },
        _id: 0,
      },
    },
  ]);

  // Reestructurar para mantener la misma estructura que el playbook
  const rulesGroupCompletion = rulesCompletion.reduce(
    (acc, rule) => {
      const groupIndex = acc.findIndex(
        (group: { name: string }) => group.name === rule.groupName,
      );

      if (groupIndex === -1) {
        acc.push({
          name: rule.groupName,
          rules: [
            {
              name: rule.ruleName,
              completionPercentage: rule.completionPercentage,
            },
          ],
        });
      } else {
        acc[groupIndex].rules.push({
          name: rule.ruleName,
          completionPercentage: rule.completionPercentage,
        });
      }

      return acc;
    },
    [] as Array<{
      name: string;
      rules: Array<{
        name: string;
        completionPercentage: number;
      }>;
    }>,
  );

  return {
    rulesGroupCompletion,
  };
}
