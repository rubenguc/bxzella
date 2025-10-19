import mongoose from "mongoose";
import {
  getAccountById,
  updateLastSyncPerCoin,
} from "@/features/accounts/server/db/accounts-db";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import { getProvider } from "@/features/providers/utils/providers-utils";
import type {
  FetchPositionHistoryForSymbolsProps,
  GetPaginatedTradesByPlaybook,
  GetPaginatedTradesByPlaybookReponse,
  GetPlaybookRulesCompletionByPlaybookId,
  GetPlaybookRulesCompletionByPlaybookIdResponse,
  GetTradeProfitByDays,
  GetTradesByAccountId,
  GetTradesByAccountIdResponse,
  GetTradesStatisticProps,
  Trade,
  TradePlaybook,
  TradeStatisticsResult,
} from "@/features/trades/interfaces/trades-interfaces";
import { TradeModel } from "@/features/trades/model/trades-model";
import { getSyncTimeRange } from "@/features/trades/utils/trades-utils";
import type { Coin } from "@/interfaces/global-interfaces";
import { getUTCDay } from "@/utils/date-utils";
import { getPaginatedData } from "@/utils/db-utils";

export async function syncPositions(
  accountId: string,
  coin: Coin = "USDT",
): Promise<boolean> {
  console.log(`syncing positions for: ${accountId}...`);

  const account = await getAccountById(accountId);
  if (!account) return false;

  const lastSyncTime = account.lastSyncPerCoin[coin];
  const timeRange = getSyncTimeRange(lastSyncTime);
  const { decriptedApiKey, decryptedSecretKey } =
    getDecryptedAccountCredentials(account);

  const providerService = getProvider(
    account.provider,
    decriptedApiKey,
    decryptedSecretKey,
  );

  const positions = await providerService.getPositionHistory({
    coin,
    startTs: timeRange.startTs,
    endTs: timeRange.endTs,
  });

  if (!positions.length) return false;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await updateLastSyncPerCoin(account._id, coin, timeRange.endTs, session);
      await saveMultipleTrades(positions, account._id, session);
    });
  } finally {
    session.endSession();
  }
  console.log("positions synced");
  return true;
}

export async function saveMultipleTrades(
  trades: Trade[],
  accountId: string,
  session: mongoose.ClientSession,
) {
  await TradeModel.bulkWrite(
    trades.map((trade) => ({
      updateOne: {
        filter: { accountId: accountId, positionId: trade.positionId },
        update: { $set: trade },
        upsert: true,
      },
    })),
    { session },
  );
}

export async function getTradesByAccountId({
  accountId,
  page,
  limit,
  coin = "USDT",
  startDate,
  endDate,
}: GetTradesByAccountId): GetTradesByAccountIdResponse {
  const find: Record<string, any> = {
    accountId,
    coin,
  };

  if (startDate && endDate) {
    const parsedStartDate = getUTCDay(startDate);
    const parsedEndDate = getUTCDay(endDate, true);

    find.openTime = { $gte: parsedStartDate, $lte: parsedEndDate };
    find.updateTime = { $gte: parsedStartDate, $lte: parsedEndDate };
  }

  return await getPaginatedData(TradeModel, find, { page, limit });
}

export function getTradesStatistic({
  accountId,
  startDate,
  endDate,
  coin = "USDT",
}: GetTradesStatisticProps): Promise<TradeStatisticsResult> {
  const parsedStartDate = getUTCDay(startDate);
  const parsedEndDate = getUTCDay(endDate, true);

  return TradeModel.aggregate([
    {
      $match: {
        accountId,
        coin,
        closeAllPositions: true,
        openTime: { $gte: parsedStartDate, $lte: parsedEndDate },
        updateTime: { $gte: parsedStartDate, $lte: parsedEndDate },
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
  accountId,
  startDate,
  endDate,
  coin = "USDT",
}: GetTradeProfitByDays) {
  const parsedStartDate = getUTCDay(startDate);
  const parsedEndDate = getUTCDay(endDate, true);

  return TradeModel.aggregate([
    {
      $match: {
        accountId,
        coin,
        closeAllPositions: true,
        updateTime: { $gte: parsedStartDate, $lte: parsedEndDate },
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
  accountId,
  startDate,
  endDate,
  coin = "USDT",
  playbookId,
  page = 1,
  limit = 10,
}: GetPaginatedTradesByPlaybook): GetPaginatedTradesByPlaybookReponse {
  const findCriteria: Record<string, unknown> = {
    accountId,
    coin,
    "playbook.id": playbookId,
  };

  if (startDate && endDate) {
    const parsedStartDate = getUTCDay(startDate);
    const parsedEndDate = getUTCDay(endDate, true);

    findCriteria.openTime = { $gte: parsedStartDate, $lte: parsedEndDate };
    findCriteria.updateTime = { $gte: parsedStartDate, $lte: parsedEndDate };
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
  accountId,
  startDate,
  endDate,
  coin = "USDT",
}: GetPlaybookRulesCompletionByPlaybookId): GetPlaybookRulesCompletionByPlaybookIdResponse {
  const parsedStartDate = getUTCDay(startDate);
  const parsedEndDate = getUTCDay(endDate, true);

  const rulesCompletion = await TradeModel.aggregate([
    {
      $match: {
        accountId,
        coin,
        closeAllPositions: true,
        openTime: { $gte: parsedStartDate, $lte: parsedEndDate },
        updateTime: { $gte: parsedStartDate, $lte: parsedEndDate },
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
