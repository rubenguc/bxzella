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
import { ITradeModel, TradeModel } from "../../model/trades";
import {
  getSyncTimeRange,
  processFilledOrders,
} from "../../utils/trades-utils";
import { Coin } from "@/global-interfaces";

async function fetchPositionHistoryForSymbols(
  apiKey: string,
  secretKey: string,
  symbols: string[],
  timeRange: { startTs: number; endTs: number },
  uid: string,
  coin: Coin = "VST",
): Promise<ITradeModel[]> {
  const batchSize = 5;
  const batches = [];
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }

  const allPositionHistories: ITradeModel[] = [];
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
      ) as ITradeModel[]),
    );

    if (index < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return allPositionHistories;
}

export async function syncPositions(uid: string, coin: Coin = "VST") {
  console.log(`syncing positions for: ${uid}...`);

  const uidSyncConfig = await getAccountSync(uid);

  const times = getSyncTimeRange(uidSyncConfig?.perpetualLastSyncTime);

  const account = await getAccountByUID(uid);
  if (!account) return [];

  const { decriptedApiKey, decryptedSecretKey } =
    getDecryptedAccountCredentials(account);

  const filledOrders = await getFilledOrders(
    decriptedApiKey,
    decryptedSecretKey,
    times,
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
      await createOrUpdateAccountSync(uid, times.endTs, session);
      await saveMultipleTrades(allPositionHistories, session);
    });
  } finally {
    session.endSession();
  }
  console.log("positions synced");
}

export async function saveMultipleTrades(
  trades: ITradeModel[],
  session: mongoose.ClientSession,
) {
  await TradeModel.insertMany(trades, { session });
}

export async function getTradesByAccountUID({
  uid,
  page,
  limit,
  coin = "VST",
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
  const skip = (page - 1) * limit;
  const total = await TradeModel.countDocuments({ accountUID: uid });
  const totalPages = Math.ceil(total / limit);

  const find: Record<string, string | number> = {
    accountUID: uid,
    coin,
  };

  if (startDate && endDate) {
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
  coin = "VST",
}: {
  accountUID: string;
  startDate: Date;
  endDate: Date;
  coin?: "VST";
}) {
  console.log({
    startDate,
    endDate,
  });

  return TradeModel.aggregate([
    {
      $match: {
        accountUID,
        coin,
        openTime: { $gte: startDate, $lte: endDate },
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
