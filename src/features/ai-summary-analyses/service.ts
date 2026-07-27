import { apiClient } from '#/lib/api-client'
import type { AiSummaryAnalysis } from '#/features/ai-summary-analyses/schema'

export interface PaginatedAnalyses {
  rows: AiSummaryAnalysis[]
  total: number
  limit: number
  offset: number
}

export async function fetchAnalysesBySubscription(
  subscriptionId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<PaginatedAnalyses> {
  const { limit = 20, offset = 0 } = options
  const { data } = await apiClient.get<PaginatedAnalyses>(
    `/ai-summary-subscriptions/${subscriptionId}/analyses`,
    { params: { limit, offset } },
  )
  return data
}
