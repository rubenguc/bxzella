import { apiClient } from '#/lib/api-client'
import type { PaginatedTradesResponse } from '#/features/trades/types'
import type { Coin } from '#/features/exchange-providers/types'
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
