import {
  createOrUpdateAccountSync,
  getAccountSync,
} from "@/features/account-sync/server/db/account-sync";
import { getAccountByUID } from "@/features/accounts/server/db/accounts";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import {
  getFilledOrders,
  getPositionHistory,
} from "@/features/bingx/bingx-api";
import mongoose from "mongoose";
import {
  getSyncTimeRange,
  processFilledOrders,
} from "@/features/trades/utils/trades-utils";
import { Coin } from "@/global-interfaces";
import { Trade } from "@/features/trades/interfaces/trades-interfaces";
import { TradeModel } from "@/features/trades/model/trades";

async function fetchPositionHistoryForSymbols(
  apiKey: string,
  secretKey: string,
  symbols: string[],
  timeRange: { startTs: number; endTs: number },
  uid: string,
  coin: Coin = "USDT",
): Promise<Trade[]> {
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

export async function syncPositions(uid: string, coin: Coin = "USDT") {
  console.log(`syncing positions for: ${uid}...`);

  const uidSyncConfig = await getAccountSync(uid, coin);

  const times = getSyncTimeRange(uidSyncConfig?.perpetualLastSyncTime);

  const account = await getAccountByUID(uid);
  if (!account) return [];

  const { decriptedApiKey, decryptedSecretKey } =
    getDecryptedAccountCredentials(account);

  const filledOrders = await getFilledOrders(
    decriptedApiKey,
    decryptedSecretKey,
    times,
    coin,
  );

  const symbolsToFetch = processFilledOrders(filledOrders);

  if (symbolsToFetch.length === 0) return;

  const allPositionHistories = await fetchPositionHistoryForSymbols(
    decriptedApiKey,
    decryptedSecretKey,
    symbolsToFetch,
    times,
    uid,
    coin,
  );

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await createOrUpdateAccountSync(uid, times.endTs, coin, session);
      await saveMultipleTrades(allPositionHistories, session);
    });
  } finally {
    session.endSession();
  }
  console.log("positions synced");
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
  uid,
  page,
  limit,
  coin = "USDT",
  startDate,
  endDate,
}: {
  uid: string;
  page: number;
  limit: number;
  coin?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const skip = page * limit;
  const total = await TradeModel.countDocuments({ accountUID: uid, coin });
  const totalPages = Math.ceil(total / limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const find: Record<string, any> = {
    accountUID: uid,
    coin,
  };

  if (startDate && endDate) {
    find.openTime = { $gte: startDate, $lte: endDate };
    find.updateTime = { $gte: startDate, $lte: endDate };
  }

  const data = await TradeModel.find(find)
    .sort({ updateTime: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data,
    totalPages,
  };
}

export function getTradesStatistic({
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
  ]);
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

export function getTradesStatisticByPair({
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
        openTime: { $gte: startDate, $lte: endDate },
        updateTime: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$symbol",
        totalNetProfit: {
          $sum: {
            $convert: {
              input: "$netProfit",
              to: "double",
              onError: 0,
            },
          },
        },
        totalNetProfitLong: {
          $sum: {
            $cond: [
              { $eq: ["$positionSide", "LONG"] },
              {
                $convert: {
                  input: "$netProfit",
                  to: "double",
                  onError: 0,
                },
              },
              0,
            ],
          },
        },
        totalNetProfitShort: {
          $sum: {
            $cond: [
              { $eq: ["$positionSide", "SHORT"] },
              {
                $convert: {
                  input: "$netProfit",
                  to: "double",
                  onError: 0,
                },
              },
              0,
            ],
          },
        },
        tradeDurations: {
          $push: {
            $subtract: [{ $toLong: "$updateTime" }, { $toLong: "$openTime" }],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        symbol: "$_id",
        totalNetProfit: 1,
        totalNetProfitLong: 1,
        totalNetProfitShort: 1,
        avgOpenTime: {
          $divide: [{ $sum: "$tradeDurations" }, { $size: "$tradeDurations" }],
        },
      },
    },
  ]);
}
