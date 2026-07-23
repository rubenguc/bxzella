import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { Button } from '#/components/ui/button'
import { AnalysesView } from '#/features/ai-summary-analyses/components/analyses-view'

export const Route = createFileRoute(
  '/dashboard/ai-summary-subscriptions/$subscriptionId',
)({
  component: SubscriptionAnalyses,
})

function SubscriptionAnalyses() {
  const { subscriptionId } = Route.useParams()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/ai-summary-subscriptions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">{m['ai_summary.analyses_title']()}</h2>
      </div>

      <AnalysesView subscriptionId={subscriptionId} />
    </div>
  )
}
