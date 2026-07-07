import { sql } from 'drizzle-orm'
import { db } from '#/db/index'
import type { DashboardStats } from '#/features/dashboard/types'

interface GetDashboardStatsParams {
  accountId: string
  startDate: string
  endDate: string
  coin: string
}

export async function getDashboardStats({
  accountId,
  startDate,
  endDate,
  coin,
}: GetDashboardStatsParams): Promise<DashboardStats> {
  const rows = await db.execute(sql`
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
  `)

  const raw = rows[0] as {
    totalTrades: number
    totalWin: number
    totalLoss: number
    sumWin: number
    sumLoss: number
    netPnL: number
  }

  const totalTrades = raw.totalTrades ?? 0
  const totalWin = raw.totalWin ?? 0
  const totalLoss = raw.totalLoss ?? 0
  const sumWin = Number(raw.sumWin) || 0
  const sumLoss = Number(raw.sumLoss) || 0
  const sumLossAbs = Math.abs(sumLoss)
  const netPnL = Number(raw.netPnL) || 0

  // profitFactor = sumWin / abs(sumLoss), or sumWin if loss is 0
  const profitFactorValue = sumLossAbs === 0
    ? sumWin
    : sumWin / sumLossAbs

  // tradeWin percentage = (totalWin / totalTrades) * 100
  const tradeWinValue = totalTrades > 0
    ? (totalWin / totalTrades) * 100
    : 0

  // avgWinLoss
  const avgWin = totalWin > 0 ? sumWin / totalWin : 0
  const avgLoss = totalLoss > 0 ? sumLossAbs / totalLoss : 0
  const avgWinLossValue =
    avgWin > 0 && avgLoss > 0 ? avgWin / avgLoss : 0

  return {
    netPnL: { value: netPnL, totalTrades },
    profitFactor: { value: profitFactorValue, sumWin, sumLoss: sumLossAbs },
    tradeWin: { value: tradeWinValue, totalWin, totalLoss },
    avgWinLoss: { value: avgWinLossValue, avgWin, avgLoss },
  }
}
