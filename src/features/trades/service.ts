import { apiClient } from '#/lib/api-client'
import type { PaginatedTradesResponse } from '#/features/trades/types'
import type { Coin, KLine } from '#/features/exchange-providers/types'
import type { Trade } from '#/features/trades/schema'

export async function fetchTrades(
  accountId: string,
  coin: Coin,
  page = 0,
  limit = 20,
): Promise<PaginatedTradesResponse> {
  const { data } = await apiClient.get<PaginatedTradesResponse>('/trades', {
    params: { exchangeAccountId: accountId, coin, page, limit },
  })
  return data
}

export async function syncTrades(
  accountId: string,
  coin: Coin,
): Promise<{ synced: boolean; syncTime: number; earliestTradeDate: string }> {
  const { data } = await apiClient.get<{
    synced: boolean
    syncTime: number
    earliestTradeDate: string
  }>('/trades/sync', {
    params: { exchangeAccountId: accountId, coin },
  })
  return data
}

export async function fetchTradeById(
  accountId: string,
  positionId: string,
): Promise<Trade> {
  const { data } = await apiClient.get<Trade>(
    `/trades/${positionId}`,
    { params: { exchangeAccountId: accountId } },
  )
  return data
}

export async function fetchKline(
  accountId: string,
  coin: Coin,
  symbol: string,
  startTime: number,
  interval: string,
): Promise<KLine[]> {
  const { data } = await apiClient.get<KLine[]>('/kline', {
    params: { accountId, coin, symbol, startTime, interval },
  })
  return data
}
