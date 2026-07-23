import type { AiSummarySubscription } from '#/features/ai-summary-subscriptions/schema'
import type { Coin } from '#/features/exchange-providers/types'

export type SubscriptionItem = AiSummarySubscription

export type SubscriptionDialogType = 'add' | 'toggle' | 'delete'

/** Shape returned by the list API — includes account name for display. */
export interface SubscriptionWithAccount extends SubscriptionItem {
  accountName: string
  accountProvider: string
}

export interface CreateSubscriptionInput {
  accountId: string
  coin: Coin
  includeNotebook?: boolean
}
