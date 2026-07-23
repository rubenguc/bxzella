import { apiClient } from '#/lib/api-client'
import type { SubscriptionWithAccount } from '#/features/ai-summary-subscriptions/types'

/** GET wrapper — fetches AI summary subscriptions for the current user. */
export async function fetchSubscriptions(): Promise<SubscriptionWithAccount[]> {
  const { data } = await apiClient.get<SubscriptionWithAccount[]>('/ai-summary-subscriptions')
  return data
}
