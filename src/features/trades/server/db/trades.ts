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

async function fetchPositionHistoryForSymbols(
  apiKey: string,
  secretKey: string,
  symbols: string[],
  timeRange: { startTs: number; endTs: number },
  uid: string,
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
        getPositionHistory(apiKey, secretKey, {
          symbol,
          startTs: timeRange.startTs,
          endTs: timeRange.endTs,
        })
          .then((r) =>
            r.data.positionHistory.map((ph) => ({
              ...ph,
              accountUID: uid,
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

export async function syncPositions(uid: string) {
  try {
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
  } catch (error) {
    console.error(error);
  }
}

export async function saveMultipleTrades(
  trades: ITradeModel[],
  session: mongoose.ClientSession,
) {
  await TradeModel.insertMany(trades, { session });
}

export async function getTradesByAccountUID(
  uid: string,
  page: number,
  limit: number,
): Promise<ITradeModel[]> {
  const skip = (page - 1) * limit;
  const trades = await TradeModel.find({
    accountUID: uid,
  })
    .sort({ updateTime: -1 })
    .skip(skip)
    .limit(limit);

  return trades;
}
