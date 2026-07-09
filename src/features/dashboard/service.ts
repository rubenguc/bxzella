import { apiClient } from '#/lib/api-client'
import type { DashboardStats, DailyPnlEntry } from '#/features/dashboard/types'
import type { OpenPosition, Trade } from '#/features/exchange-providers/types'

interface GetDashboardStatsParams {
  accountId: string
  startDate: string
  endDate: string
  coin: string
}

interface GetDailyPnlParams {
  accountId: string
  coin: string
  month: string
}

interface GetOpenPositionsParams {
  accountId: string
  coin: string
}

interface GetRecentTradesParams {
  accountId: string
  coin: string
}

export async function getDashboardStats(
  params: GetDashboardStatsParams,
): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/dashboard', {
    params: {
      accountId: params.accountId,
      startDate: params.startDate,
      endDate: params.endDate,
      coin: params.coin,
    },
  })
  return data
}

export async function getDailyPnl(
  params: GetDailyPnlParams,
): Promise<DailyPnlEntry[]> {
  const { data } = await apiClient.get<DailyPnlEntry[]>('/dashboard/daily-pnl', {
    params: {
      accountId: params.accountId,
      coin: params.coin,
      month: params.month,
    },
  })
  return data
}

export async function getOpenPositions(
  params: GetOpenPositionsParams,
): Promise<OpenPosition[]> {
  const { data } = await apiClient.get<OpenPosition[]>('/dashboard/open-positions', {
    params: {
      accountId: params.accountId,
      coin: params.coin,
    },
  })
  return data
}

export async function getRecentTrades(
  params: GetRecentTradesParams,
): Promise<Trade[]> {
  const { data } = await apiClient.get<Trade[]>('/dashboard/recent-trades', {
    params: {
      accountId: params.accountId,
      coin: params.coin,
    },
  })
  return data
}
