import { Plus } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/components/ui/button'
import { useAccounts } from '#/features/exchange-accounts/context'

export function AccountsHeader() {
  const { setOpen } = useAccounts()

  return (
    <div className="mb-6 flex justify-end">
      <Button className="gap-2" onClick={() => setOpen('add')}>
        <Plus className="h-4 w-4" />
        {m['accounts.add_account']()}
      </Button>
    </div>
  )
}
