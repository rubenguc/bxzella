import { apiClient } from '#/lib/api-client'
import type { DashboardStats } from '#/features/dashboard/types'

interface GetDashboardStatsParams {
  accountId: string
  startDate: string
  endDate: string
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
