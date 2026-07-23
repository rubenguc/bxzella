import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, TriangleAlert } from 'lucide-react'

import { m } from '#/paraglide/messages'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import type { SubscriptionWithAccount } from '#/features/ai-summary-subscriptions/types'
import { deleteSubscriptionAction } from '#/features/ai-summary-subscriptions/server-actions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: SubscriptionWithAccount
}

export function SubscriptionDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSubscriptionAction({ data: currentRow.id })
      await queryClient.invalidateQueries({ queryKey: ['ai-summary-subscriptions'] })
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="h-5 w-5" />
            {m['ai_summary.delete_subscription']()}
          </DialogTitle>
          <DialogDescription>
            {m['common_messages.are_your_sure_want_to_delete']()} <strong>{currentRow.accountName}</strong> ({currentRow.coin})?
            <br />
            {m['common_messages.this_cannot_be_undone']()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {m['common_messages.cancel']()}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {m['common_messages.deleting_action']()}
              </>
            ) : (
              m['common_messages.delete']()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
