import { createFileRoute } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import { SyncButton } from '#/features/trades/components/sync-button'
import { TradesTable } from '#/features/trades/components/table'
import { useUserConfig } from '#/store/user-config'

export const Route = createFileRoute('/dashboard/trades')({
  component: Trades,
})

function Trades() {
  const { selectedAccount, coin } = useUserConfig()

  return (
    <div className="space-y-4">
      {selectedAccount && (
        <SyncButton accountId={selectedAccount.id} coin={coin} />
      )}

      {selectedAccount ? (
        <TradesTable accountId={selectedAccount.id} coin={coin} />
      ) : (
        <div className="text-sm text-muted-foreground">
          {m['accounts.select_account']()}
        </div>
      )}
    </div>
  )
}
