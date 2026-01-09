import mongoose from "mongoose";
import type {
  DayLog,
  DayLogDocument,
  GetDayLogByDayProps,
  GetDayLogsByAccountIdProps,
  GetDayLogsByAccountIdResponse,
  GetDayProfitsWithTradesProps,
  GetDayProfitsWithTradesResponse,
  GetFullDayProfitsWithTradesResponse,
} from "@/features/day-log/interfaces/day-log-interfaces";
import { DayLogModel } from "@/features/day-log/model/day-log-model";
import type { PaginationResponse } from "@/interfaces/global-interfaces";
import { getPaginatedData } from "@/utils/db-utils";

export async function createOrUpdateDayLogs(
  dayLogs: DayLog[],
  session?: mongoose.ClientSession,
): Promise<void> {
  if (!dayLogs || dayLogs.length === 0) return;

  await DayLogModel.bulkWrite(
    // @ts-expect-error
    dayLogs.map(({ _id, ...dayLog }) => {
      const accountId = new mongoose.Types.ObjectId(dayLog.accountId as string);

      return {
        updateOne: {
          filter: {
            date: dayLog.date,
            accountId,
            coin: dayLog.coin,
          },
          update: {
            ...dayLog,
            accountId,
            coin: dayLog.coin,
          },
          upsert: true,
        },
      };
    }),
    { session },
  );
}

export async function getDayLogByDate({
  accountId,
  date,
  coin,
}: GetDayLogByDayProps): Promise<DayLogDocument | null> {
  return await DayLogModel.findOne({
    accountId,
    date,
    coin,
  })
    .populate("trades")
    .lean<DayLogDocument>();
}

export async function getDayLogsByAccountId({
  accountId,
  startDate,
  endDate,
  coin = "USDT",
  page = 1,
  limit = 50,
}: GetDayLogsByAccountIdProps): GetDayLogsByAccountIdResponse {
  const find: Record<string, any> = {
    accountId: new mongoose.Types.ObjectId(accountId),
    coin,
  };

  if (startDate && endDate) {
    find.date = { $gte: startDate, $lte: endDate };
  }

  return await getPaginatedData(DayLogModel, find, {
    page,
    limit,
    sortBy: {
      date: -1,
    },
    populate: "trades",
  });
}

export async function getDayProfitsWithTrades({
  accountId,
  coin,
  startDate,
  endDate,
  limit,
  page,
}: GetDayProfitsWithTradesProps): Promise<
  PaginationResponse<GetDayProfitsWithTradesResponse>
> {
  const find: Record<string, any> = {
    accountId: new mongoose.Types.ObjectId(accountId),
    coin,
  };

  if (startDate && endDate) {
    find.date = { $gte: startDate, $lte: endDate };
  }

  return await getPaginatedData(DayLogModel, find, {
    page,
    limit,
    sortBy: {
      date: -1,
    },
    projection: {
      _id: 1,
      date: 1,
      trades: 1,
      netPnL: 1,
      totalTrades: 1,
    },
    populate: {
      path: "trades",
      select:
        "openTime updateTime symbol positionSide leverage netProfit positionId",
    },
  });
}

export async function getFullDayProfitsWithTrades({
  accountId,
  coin,
  startDate,
  endDate,
  limit,
  page,
}: GetDayProfitsWithTradesProps): Promise<
  PaginationResponse<GetFullDayProfitsWithTradesResponse>
> {
  const find: Record<string, any> = {
    accountId: new mongoose.Types.ObjectId(accountId),
    coin,
  };

  if (startDate && endDate) {
    find.date = { $gte: startDate, $lte: endDate };
  }

  return await getPaginatedData(DayLogModel, find, {
    page,
    limit,
    sortBy: {
      date: -1,
    },
    populate: {
      path: "trades",
      select:
        "openTime updateTime symbol positionSide leverage netProfit positionId",
    },
  });
}
