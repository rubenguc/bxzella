import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionsProvider } from '#/features/ai-summary-subscriptions/context'
import { SubscriptionsHeader } from '#/features/ai-summary-subscriptions/components/header'
import { SubscriptionsTable } from '#/features/ai-summary-subscriptions/components/table'
import { SubscriptionsDialogs } from '#/features/ai-summary-subscriptions/components/dialogs'

export const Route = createFileRoute('/dashboard/ai-summary-subscriptions')({
  component: AiSummarySubscriptions,
})

function AiSummarySubscriptions() {
  return (
    <SubscriptionsProvider>
      <SubscriptionsHeader />
      <SubscriptionsTable />
      <SubscriptionsDialogs />
    </SubscriptionsProvider>
  )
}
