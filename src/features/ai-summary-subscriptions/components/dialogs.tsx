import { useSubscriptions } from '#/features/ai-summary-subscriptions/context'
import { SubscriptionActionDialog } from './action-dialog'
import { SubscriptionDeleteDialog } from './delete-dialog'

export function SubscriptionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSubscriptions()

  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      {open === 'add' && (
        <SubscriptionActionDialog open currentRow={null} onOpenChange={close} />
      )}
      {open === 'delete' && currentRow && (
        <SubscriptionDeleteDialog open currentRow={currentRow} onOpenChange={close} />
      )}
    </>
  )
}
