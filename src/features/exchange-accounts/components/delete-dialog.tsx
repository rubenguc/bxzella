import { useQueryClient } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'

import { m } from '#/paraglide/messages'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import type { AccountItem } from '#/features/exchange-accounts/types'
import { deleteAccountAction } from '#/features/exchange-accounts/server-actions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AccountItem
}

export function AccountsDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    await deleteAccountAction({ data: currentRow.id })
    await queryClient.invalidateQueries({ queryKey: ['exchange-accounts'] })
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="h-5 w-5" />
            {m['accounts.delete_account']()}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {m['common_messages.are_your_sure_want_to_delete']()} <strong>{currentRow.name}</strong>?
            <br />
            {m['common_messages.this_cannot_be_undone']()}
            <br />
            {m['accounts.delete_account_warning']()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m['common_messages.cancel']()}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{m['common_messages.delete']()}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
