import { apiClient } from '#/lib/api-client'
import type { Trade } from '#/features/exchange-providers/types'

interface GetRecentTradesParams {
  accountId: string
  coin: string
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
