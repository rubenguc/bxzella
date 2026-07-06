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
import type { AccountItem } from '#/features/exchange-accounts/types'
import { deleteAccountAction } from '#/features/exchange-accounts/server-actions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AccountItem
}

export function AccountsDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAccountAction({ data: currentRow.id })
      await queryClient.invalidateQueries({ queryKey: ['exchange-accounts'] })
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
            {m['accounts.delete_account']()}
          </DialogTitle>
          <DialogDescription>
            {m['common_messages.are_your_sure_want_to_delete']()} <strong>{currentRow.name}</strong>?
            <br />
            {m['common_messages.this_cannot_be_undone']()}
            <br />
            {m['accounts.delete_account_warning']()}
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
