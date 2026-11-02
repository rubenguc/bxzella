import { createFileRoute } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import { TradesTable } from '#/features/trades/components/table'
import { TradesToolbar } from '#/features/trades/components/trades-toolbar'
import { useUserConfig } from '#/store/user-config'

interface TradesSearch {
  /** Pre-fills the symbol search field, e.g. arriving from coin performances. */
  symbol?: string
}

export const Route = createFileRoute('/dashboard/trades/')({
  validateSearch: (search: Record<string, unknown>): TradesSearch => ({
    symbol:
      typeof search.symbol === 'string' && search.symbol.length > 0
        ? search.symbol
        : undefined,
  }),
  component: Trades,
})

function Trades() {
  const { selectedAccount, coin } = useUserConfig()
  const { symbol } = Route.useSearch()

  return (
    <div className="space-y-4">
      {selectedAccount && (
        <TradesToolbar
          accountId={selectedAccount.id}
          coin={coin}
        />
      )}

      {selectedAccount ? (
        <TradesTable
          accountId={selectedAccount.id}
          coin={coin}
          accountName={selectedAccount.name}
          initialSymbol={symbol}
        />
      ) : (
        <div className="text-sm text-muted-foreground">
          {m['accounts.select_account']()}
        </div>
      )}
    </div>
  )
}
