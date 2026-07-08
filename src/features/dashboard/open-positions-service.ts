import { apiClient } from '#/lib/api-client'
import type { OpenPosition } from '#/features/exchange-providers/types'

interface GetOpenPositionsParams {
  accountId: string
  coin: string
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
