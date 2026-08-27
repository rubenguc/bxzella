import { createFileRoute } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import { StrategiesProvider, useStrategies } from '#/features/strategies/context'
import { StrategiesHeader } from '#/features/strategies/components/header'
import { StrategiesTable } from '#/features/strategies/components/table'
import { StrategiesDeleteDialog } from '#/features/strategies/components/delete-dialog'
import { StrategyDialog } from '#/features/strategies/components/strategy-dialog'
import { useUserConfig } from '#/store/user-config'

export const Route = createFileRoute('/dashboard/strategies/')({
  component: Strategies,
})

function Strategies() {
  const { selectedAccount, coin } = useUserConfig()

  if (!selectedAccount) {
    return (
      <p className="text-center text-xl text-muted-foreground">
        {m['accounts.select_account']()}
      </p>
    )
  }

  return (
    <StrategiesProvider>
      <StrategiesHeader />
      <StrategiesTable accountId={selectedAccount.id} coin={coin} />
      <StrategiesDialogs />
    </StrategiesProvider>
  )
}

function StrategiesDialogs() {
  const { open, setOpen, currentRow } = useStrategies()

  return (
    <>
      {(open === 'create' || open === 'edit') && (
        <StrategyDialog
          open
          onOpenChange={(v) => !v && setOpen(null)}
          currentRow={open === 'edit' ? currentRow : null}
        />
      )}
      {open === 'delete' && currentRow && (
        <StrategiesDeleteDialog
          open
          onOpenChange={(v) => !v && setOpen(null)}
          currentRow={currentRow}
        />
      )}
    </>
  )
}