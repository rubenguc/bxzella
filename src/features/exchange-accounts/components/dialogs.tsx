import { useAccounts } from '#/features/exchange-accounts/context'
import { AccountsActionDialog } from './action-dialog'
import { AccountsDeleteDialog } from './delete-dialog'

export function AccountsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAccounts()

  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      {open === 'add' && (
        <AccountsActionDialog open currentRow={null} onOpenChange={close} />
      )}
      {open === 'edit' && currentRow && (
        <AccountsActionDialog open currentRow={currentRow} onOpenChange={close} />
      )}
      {open === 'delete' && currentRow && (
        <AccountsDeleteDialog open currentRow={currentRow} onOpenChange={close} />
      )}
    </>
  )
}
