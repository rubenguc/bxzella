import { apiClient } from '#/lib/api-client'
import type { DailyPnlEntry } from '#/features/dashboard/types'

interface GetDailyPnlParams {
  accountId: string
  coin: string
  month: string
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
