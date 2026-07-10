import { db } from "#/db/index";
import type {
  DashboardStats,
  DayProfitEntry,
  DailyPnlEntry,
} from "#/features/dashboard/types";
import { sql } from "drizzle-orm";

interface GetDashboardStatsParams {
  accountId: string;
  startDate: string;
  endDate: string;
  coin: string;
}

export async function getDashboardStats({
  accountId,
  startDate,
  endDate,
  coin,
}: GetDashboardStatsParams): Promise<DashboardStats> {
  const [statsResult, dayProfitsResult] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS "totalTrades",
        COUNT(*) FILTER (WHERE net_profit::numeric > 0)::int AS "totalWin",
        COUNT(*) FILTER (WHERE net_profit::numeric < 0)::int AS "totalLoss",
        COALESCE(SUM(CASE WHEN net_profit::numeric > 0 THEN net_profit::numeric ELSE 0 END), 0) AS "sumWin",
        COALESCE(SUM(CASE WHEN net_profit::numeric < 0 THEN net_profit::numeric ELSE 0 END), 0) AS "sumLoss",
        COALESCE(SUM(net_profit::numeric), 0) AS "netPnL"
      FROM "trade"
      WHERE account_id = ${accountId}
        AND coin = ${coin}
        AND close_all_positions = true
        AND update_time >= ${startDate}::timestamp
        AND update_time <= ${endDate}::timestamp
    `),
    db.execute(sql`
      SELECT
        update_time::date AS "date",
        COALESCE(SUM(net_profit::numeric), 0) AS "netPnL"
      FROM "trade"
      WHERE account_id = ${accountId}
        AND coin = ${coin}
        AND close_all_positions = true
        AND update_time >= ${startDate}::timestamp
        AND update_time <= ${endDate}::timestamp
      GROUP BY update_time::date
      ORDER BY update_time::date ASC
    `),
  ]);

  const raw = statsResult.rows?.[0] as
    | {
        totalTrades: number;
        totalWin: number;
        totalLoss: number;
        sumWin: number;
        sumLoss: number;
        netPnL: number;
      }
    | undefined;

  const dayProfits = (dayProfitsResult.rows ?? []) as DayProfitEntry[];

  if (!raw) {
    return {
      netPnL: { value: 0, totalTrades: 0 },
      profitFactor: { value: 0, sumWin: 0, sumLoss: 0 },
      tradeWin: { value: 0, totalWin: 0, totalLoss: 0 },
      avgWinLoss: { value: 0, avgWin: 0, avgLoss: 0 },
      dayProfits,
    };
  }

  const totalTrades = raw.totalTrades ?? 0;
  const totalWin = raw.totalWin ?? 0;
  const totalLoss = raw.totalLoss ?? 0;
  const sumWin = Number(raw.sumWin) || 0;
  const sumLoss = Number(raw.sumLoss) || 0;
  const sumLossAbs = Math.abs(sumLoss);
  const netPnL = Number(raw.netPnL) || 0;

  // profitFactor = sumWin / abs(sumLoss), or sumWin if loss is 0
  const profitFactorValue = sumLossAbs === 0 ? sumWin : sumWin / sumLossAbs;

  // tradeWin percentage = (totalWin / totalTrades) * 100
  const tradeWinValue = totalTrades > 0 ? (totalWin / totalTrades) * 100 : 0;

  // avgWinLoss
  const avgWin = totalWin > 0 ? sumWin / totalWin : 0;
  const avgLoss = totalLoss > 0 ? sumLossAbs / totalLoss : 0;
  const avgWinLossValue = avgWin > 0 && avgLoss > 0 ? avgWin / avgLoss : 0;

  return {
    netPnL: { value: netPnL, totalTrades },
    profitFactor: { value: profitFactorValue, sumWin, sumLoss: sumLossAbs },
    tradeWin: { value: tradeWinValue, totalWin, totalLoss },
    avgWinLoss: { value: avgWinLossValue, avgWin, avgLoss },
    dayProfits,
  };
}

interface GetDailyPnlParams {
  accountId: string;
  coin: string;
  startDate: string;
  endDate: string;
  timezoneOffset: number;
}

export async function getDailyPnl({
  accountId,
  coin,
  startDate,
  endDate,
  timezoneOffset,
}: GetDailyPnlParams): Promise<DailyPnlEntry[]> {
  const result = await db.execute(sql`
    SELECT
      local_date AS "date",
      COALESCE(SUM(net_profit), 0) AS "netPnL",
      COUNT(*)::int AS "totalTrades",
      COALESCE(
        json_agg(
          json_build_object(
            'positionId', position_id,
            'symbol', symbol,
            'positionSide', position_side,
            'leverage', leverage,
            'openTime', open_time,
            'updateTime', update_time,
            'netProfit', net_profit,
            'coin', coin
          ) ORDER BY update_time DESC
        ) FILTER (WHERE close_all_positions = true),
        '[]'::json
      ) AS "trades"
    FROM (
      SELECT
        (update_time + ${timezoneOffset} * INTERVAL '1 hour')::date AS local_date,
        net_profit::numeric AS net_profit,
        position_id,
        symbol,
        position_side,
        leverage,
        open_time,
        update_time,
        coin,
        close_all_positions
      FROM "trade"
      WHERE account_id = ${accountId}
        AND coin = ${coin}
    ) sub
    WHERE local_date >= ${startDate}::date
      AND local_date <= ${endDate}::date
    GROUP BY local_date
    ORDER BY local_date ASC
  `);

  return (result.rows ?? []) as DailyPnlEntry[];
}
