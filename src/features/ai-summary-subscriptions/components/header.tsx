import { Plus } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/components/ui/button'
import { useSubscriptions } from '#/features/ai-summary-subscriptions/context'

export function SubscriptionsHeader() {
  const { setOpen } = useSubscriptions()

  return (
    <div className="mb-6 flex justify-end">
      <Button className="gap-2" onClick={() => setOpen('add')}>
        <Plus className="h-4 w-4" />
        {m['ai_summary.add_subscription']()}
      </Button>
    </div>
  )
}
