import { addMilliseconds } from "date-fns";
import type mongoose from "mongoose";
import type {
  DayLog,
  DayLogDocument,
} from "@/features/day-log/interfaces/day-log-interfaces";
import {
  createOrUpdateDayLogs,
  getDayLogByDate,
} from "@/features/day-log/server/db/day-log-db";
import { calculateDayLogValues } from "@/features/day-log/utils/day-log-utils";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { getTradesByPositionIds } from "@/features/trades/server/db/trades-db";
import type { Coin } from "@/interfaces/global-interfaces";

export async function registerDayLogs(
  {
    accountId,
    coin = "USDT",
    positionIds = [],
    timezone,
  }: {
    accountId: string;
    coin: Coin;
    positionIds: string[];
    timezone: number;
  },
  session?: mongoose.ClientSession,
): Promise<void> {
  if (positionIds.length === 0) return;

  const positions: TradeDocument[] = await getTradesByPositionIds(
    accountId,
    positionIds,
    coin,
  );

  const tradesByDate: { [date: string]: TradeDocument[] } = {};
  for (const position of positions) {
    if (position.updateTime) {
      const date = position.updateTime.toISOString();
      const adjustedTime = addMilliseconds(date, timezone);
      const dateStr = adjustedTime.toISOString().split("T")[0];

      if (!tradesByDate[dateStr]) {
        tradesByDate[dateStr] = [];
      }
      tradesByDate[dateStr].push(position);
    }
  }

  // Collect all day logs to be updated
  const dayLogsToSave: DayLog[] = [];

  for (const [date, dateTrades] of Object.entries(tradesByDate)) {
    let dayLog = await getDayLogByDate({ accountId, date, coin });

    if (!dayLog) {
      // @ts-expect-error ---
      dayLog = {
        accountId,
        coin,
        date,
        netPnL: 0,
        totalTrades: 0,
        winRate: 0,
        winners: 0,
        lossers: 0,
        commissions: 0,
        profitFactor: 0,
        trades: [],
      } as DayLog;
    }

    const existingTradeIds = new Set(
      (dayLog!.trades as TradeDocument[]).map((trade) =>
        typeof trade === "string" ? trade : trade.positionId,
      ),
    );

    // Filter out trades that already exist in the day log
    const newTrades = dateTrades.filter(
      (trade) => !existingTradeIds.has(trade.positionId),
    );

    // Combine existing trades with new trades
    const allTrades = [...(dayLog!.trades as TradeDocument[]), ...newTrades];

    const calculatedValues = calculateDayLogValues(allTrades);
    const updatedDayLog = {
      ...dayLog,
      ...calculatedValues,
    };

    dayLogsToSave.push(updatedDayLog as DayLogDocument);
  }

  // Save all day logs in a single bulk operation
  if (dayLogsToSave.length > 0) {
    await createOrUpdateDayLogs(dayLogsToSave, session);
  }
}
