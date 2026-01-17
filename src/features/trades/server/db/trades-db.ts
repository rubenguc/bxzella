import mongoose from "mongoose";
import {
  getAccountById,
  updateEarliestTradeDatePerCoin,
  updateLastSyncPerCoin,
} from "@/features/accounts/server/db/accounts-db";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import { getProvider } from "@/features/providers/utils/providers-utils";
import type {
  GetCoinPerformanceResponse,
  GetPaginatedTradesByPlaybook,
  GetPaginatedTradesByPlaybookReponse,
  GetPlaybookRulesCompletionByPlaybookId,
  GetPlaybookRulesCompletionByPlaybookIdResponse,
  GetTradeProfitByDays,
  GetTradesByAccountId,
  GetTradesByAccountIdResponse,
  GetTradesStatisticProps,
  Trade,
  TradeDocument,
  TradePlaybook,
  TradeStatisticsResult,
} from "@/features/trades/interfaces/trades-interfaces";
import { TradeModel } from "@/features/trades/model/trades-model";
import type { Coin } from "@/interfaces/global-interfaces";
import { getUTCDay } from "@/utils/date-utils";
import { getPaginatedData } from "@/utils/db-utils";
import { adjustDateToUTC } from "../../utils/trades-utils";
import { registerDayLogs } from "@/features/day-log/utils/day-log-utils";

export async function syncPositions(
  accountId: string,
  coin: Coin = "USDT",
  timezone: number = 0,
): Promise<{
  synced: boolean;
  syncTime: number;
  earliestTradeDate: string;
}> {
  console.log(`syncing positions for: ${accountId}...`);

  const account = await getAccountById(accountId);
  if (!account)
    return {
      synced: false,
      syncTime: 0,
      earliestTradeDate: "",
    };

  const coinToSearch = account.provider === "bitunix" ? "USDT" : coin;

  const lastSyncTime = account.lastSyncPerCoin[coinToSearch] || 0;

  const { decriptedApiKey, decryptedSecretKey } =
    getDecryptedAccountCredentials(account);

  const providerService = getProvider(
    account.provider,
    decriptedApiKey,
    decryptedSecretKey,
  );

  const positions = await providerService.getPositionHistory({
    coin: coinToSearch,
    lastSyncTime,
  });

  if (!positions.length)
    return {
      synced: false,
      syncTime: 0,
      earliestTradeDate: "",
    };

  const session = await mongoose.startSession();

  const syncTime = Date.now();
  let earliestTradeDate = "";

  try {
    await session.withTransaction(async () => {
      await updateLastSyncPerCoin(account._id, coinToSearch, syncTime, session);
      await saveMultipleTrades(positions, account._id, session);

      await registerDayLogs(
        {
          accountId,
          coin: coinToSearch,
          positionIds:
            positions.map((position) => position.positionId as string) || [],
          timezone,
        },
        session,
      );
    });
  } finally {
    session.endSession();

    if (!account.earliestTradeDatePerCoin[coin]) {
      const oldestPosition = positions.reduce((prev, curr) =>
        prev.openTime! < curr.openTime! ? prev : curr,
      );

      const result = await updateEarliestTradeDatePerCoin(
        account._id,
        coin,
        oldestPosition.openTime!,
      );

      earliestTradeDate = result.earliestTradeDatePerCoin[coin] || 0;
    }
  }
  return {
    synced: true,
    syncTime,
    earliestTradeDate,
  };
}

export async function saveMultipleTrades(
  trades: Partial<Trade>[],
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

export async function getTradesByPositionIds(
  accountId: string,
  positionIds: string[],
  coin: Coin,
  session?: mongoose.ClientSession,
) {
  return await TradeModel.find(
    {
      accountId,
      positionId: { $in: positionIds },
      coin,
    },
    null,
    {
      session,
    },
  ).lean<TradeDocument[]>();
}

export async function getTradesByAccountId(
  {
    accountId,
    page,
    limit,
    coin = "USDT",
    startDate,
    endDate,
  }: GetTradesByAccountId,
  timezone: number,
): GetTradesByAccountIdResponse {
  const find: Record<string, any> = {
    accountId,
    coin,
  };

  if (startDate && endDate) {
    const parsedStartDate = adjustDateToUTC(startDate, timezone);
    const parsedEndDate = adjustDateToUTC(endDate, timezone, true);

    find.openTime = { $gte: parsedStartDate, $lte: parsedEndDate };
    find.updateTime = { $gte: parsedStartDate, $lte: parsedEndDate };
  }

  return await getPaginatedData(TradeModel, find, {
    page,
    limit,
    sortBy: {
      updateTime: -1,
    },
  });
}

export async function getTradesStatistic(
  { accountId, startDate, endDate, coin = "USDT" }: GetTradesStatisticProps,
  timezone: number,
): Promise<TradeStatisticsResult> {
  const parsedStartDate = adjustDateToUTC(startDate, timezone);
  const parsedEndDate = adjustDateToUTC(endDate, timezone, true);

  const result = await TradeModel.aggregate([
    {
      $match: {
        accountId: new mongoose.Types.ObjectId(accountId),
        coin,
        closeAllPositions: true,
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
        adjustedUpdateTime: {
          $add: ["$updateTime", timezone],
        },
      },
    },
    {
      $facet: {
        stats: [
          {
            $group: {
              _id: null,
              totalTrades: { $sum: 1 },
              totalWin: {
                $sum: { $cond: [{ $gt: ["$numericNetProfit", 0] }, 1, 0] },
              },
              totalLoss: {
                $sum: { $cond: [{ $lt: ["$numericNetProfit", 0] }, 1, 0] },
              },
              sumWin: {
                $sum: {
                  $cond: [
                    { $gt: ["$numericNetProfit", 0] },
                    "$numericNetProfit",
                    0,
                  ],
                },
              },
              sumLoss: {
                $sum: {
                  $cond: [
                    { $lt: ["$numericNetProfit", 0] },
                    "$numericNetProfit",
                    0,
                  ],
                },
              },
              netPnL: { $sum: "$numericNetProfit" },
            },
          },
          {
            $project: {
              _id: 0,
              profitFactor: {
                value: {
                  $cond: [
                    { $eq: [{ $abs: "$sumLoss" }, 0] },
                    "$sumWin",
                    { $divide: ["$sumWin", { $abs: "$sumLoss" }] },
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
                        {
                          $cond: [
                            { $eq: ["$totalTrades", 0] },
                            1,
                            "$totalTrades",
                          ],
                        },
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
                      $and: [
                        { $ne: ["$totalWin", 0] },
                        { $ne: ["$totalLoss", 0] },
                      ],
                    },
                    {
                      $divide: [
                        { $divide: ["$sumWin", "$totalWin"] },
                        { $divide: [{ $abs: "$sumLoss" }, "$totalLoss"] },
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
                    { $divide: [{ $abs: "$sumLoss" }, "$totalLoss"] },
                  ],
                },
              },
              netPnL: {
                value: "$netPnL",
                totalTrades: "$totalTrades",
              },
            },
          },
        ],
        dayProfits: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$adjustedUpdateTime",
                },
              },
              profit: { $sum: "$numericNetProfit" },
            },
          },
          {
            $project: {
              _id: 0,
              day: "$_id",
              profit: 1,
            },
          },
          {
            $sort: { day: 1 },
          },
        ],
      },
    },
    {
      $project: {
        stats: { $arrayElemAt: ["$stats", 0] },
        dayProfits: "$dayProfits",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$stats", { dayProfits: "$dayProfits" }],
        },
      },
    },
  ]);

  return result[0] || {};
}

export function getTradeProfitByDays(
  { accountId, startDate, endDate, coin = "USDT" }: GetTradeProfitByDays,
  timezone: number,
) {
  const parsedStartDate = adjustDateToUTC(startDate, timezone);
  const parsedEndDate = adjustDateToUTC(endDate, timezone, true);

  return TradeModel.aggregate([
    {
      $match: {
        accountId: new mongoose.Types.ObjectId(accountId),
        coin,
        closeAllPositions: true,
        updateTime: { $gte: parsedStartDate, $lte: parsedEndDate },
      },
    },
    {
      $addFields: {
        localDay: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: { $add: ["$updateTime", timezone] },
          },
        },
      },
    },
    {
      $group: {
        _id: "$localDay",
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
      $project: {
        _id: 1,
        netProfit: 1,
        trades: {
          $sortArray: {
            input: "$trades",
            sortBy: { updateTime: -1 },
          },
        },
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

export async function getPlaybookRulesCompletionByPlaybookId(
  {
    playbookId,
    accountId,
    startDate,
    endDate,
    coin = "USDT",
  }: GetPlaybookRulesCompletionByPlaybookId,
  timezone: number,
): GetPlaybookRulesCompletionByPlaybookIdResponse {
  const parsedStartDate = adjustDateToUTC(startDate, timezone);
  const parsedEndDate = adjustDateToUTC(endDate, timezone, true);

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

export async function getTradesStatisticsBySymbol(
  { accountId, startDate, endDate, coin }: GetTradesStatisticProps,
  timezone: number,
): Promise<GetCoinPerformanceResponse> {
  const parsedStartDate = adjustDateToUTC(startDate, timezone);
  const parsedEndDate = adjustDateToUTC(endDate, timezone, true);

  const matchStage: mongoose.PipelineStage.Match = {
    $match: {
      accountId: new mongoose.Types.ObjectId(accountId),
      closeAllPositions: true,
      coin: coin as string,
      openTime: { $gte: parsedStartDate, $lte: parsedEndDate },
      updateTime: { $gte: parsedStartDate, $lte: parsedEndDate },
    },
  };

  const addFieldsStage: mongoose.PipelineStage.AddFields = {
    $addFields: {
      numericNetProfit: {
        $convert: {
          input: "$netProfit",
          to: "double",
          onError: 0,
        },
      },
    },
  };

  const facetStage: mongoose.PipelineStage.Facet = {
    $facet: {
      by_position: [
        {
          $group: {
            _id: {
              symbol: "$symbol",
              positionSide: "$positionSide",
            },
            totalTrades: { $sum: 1 },
            totalWin: {
              $sum: { $cond: [{ $gt: ["$numericNetProfit", 0] }, 1, 0] },
            },
            totalLoss: {
              $sum: { $cond: [{ $lt: ["$numericNetProfit", 0] }, 1, 0] },
            },
            netPnL: { $sum: "$numericNetProfit" },
          },
        },
        {
          $project: {
            _id: 0,
            symbol: "$_id.symbol",
            positionSide: "$_id.positionSide",
            netPnL: "$netPnL",
            totalTrades: "$totalTrades",
            winners: "$totalWin",
            lossers: "$totalLoss",
            winRate: {
              $multiply: [
                {
                  $divide: [
                    "$totalWin",
                    {
                      $cond: [{ $eq: ["$totalTrades", 0] }, 1, "$totalTrades"],
                    },
                  ],
                },
                100,
              ],
            },
          },
        },
      ],

      general: [
        {
          $group: {
            _id: {
              symbol: "$symbol",
            },
            totalTrades: { $sum: 1 },
            netPnL: { $sum: "$numericNetProfit" },
          },
        },
        {
          $project: {
            _id: 0,
            symbol: "$_id.symbol",
            netPnL: "$netPnL",
            totalTrades: "$totalTrades",
          },
        },
      ],
    },
  };

  const aggregationResult = await TradeModel.aggregate([
    matchStage,
    addFieldsStage,
    facetStage,
  ]);

  const facetResult = aggregationResult[0];

  const finalResult: GetCoinPerformanceResponse =
    {} as GetCoinPerformanceResponse;

  for (const item of facetResult.by_position) {
    const symbolKey = item.symbol as string;
    const positionSide = item.positionSide as "LONG" | "SHORT";

    if (!finalResult[symbolKey]) {
      finalResult[symbolKey] = {
        LONG: {
          netPnL: 0,
          totalTrades: 0,
          lossers: 0,
          winRate: 0,
          winners: 0,
        },
        SHORT: {
          netPnL: 0,
          totalTrades: 0,
          lossers: 0,
          winRate: 0,
          winners: 0,
        },
        GENERAL: {
          netPnL: 0,
          totalTrades: 0,
        },
      };
    }

    delete item.symbol;
    delete item.positionSide;

    finalResult[symbolKey][positionSide] = item;
  }

  for (const item of facetResult.general) {
    const symbolKey = item.symbol as string;

    if (!finalResult[symbolKey]) {
      finalResult[symbolKey] = {
        LONG: {
          netPnL: 0,
          totalTrades: 0,
          lossers: 0,
          winRate: 0,
          winners: 0,
        },
        SHORT: {
          netPnL: 0,
          totalTrades: 0,
          lossers: 0,
          winRate: 0,
          winners: 0,
        },
        GENERAL: {
          netPnL: 0,
          totalTrades: 0,
        },
      };
    }

    delete item.symbol;

    finalResult[symbolKey].GENERAL = item;
  }

  return finalResult;
}

export function getTradeByAccountId({
  accountId,
  positionId,
}: Pick<Trade, "positionId" | "accountId">): Promise<TradeDocument | null> {
  return TradeModel.findOne({ accountId, positionId }).lean<TradeDocument>();
}
