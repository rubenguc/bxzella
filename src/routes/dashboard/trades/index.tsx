import { createFileRoute } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import { TradesTable } from '#/features/trades/components/table'
import { TradesToolbar } from '#/features/trades/components/trades-toolbar'
import { useUserConfig } from '#/store/user-config'

export const Route = createFileRoute('/dashboard/trades/')({
  component: Trades,
})

function Trades() {
  const { selectedAccount, coin } = useUserConfig()

  return (
    <div className="space-y-4">
      {selectedAccount && (
        <TradesToolbar
          accountId={selectedAccount.id}
          coin={coin}
        />
      )}

      {selectedAccount ? (
        <TradesTable accountId={selectedAccount.id} coin={coin} accountName={selectedAccount.name} />
      ) : (
        <div className="text-sm text-muted-foreground">
          {m['accounts.select_account']()}
        </div>
      )}
    </div>
  )
}