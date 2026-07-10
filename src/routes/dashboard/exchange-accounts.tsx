import { createFileRoute } from '@tanstack/react-router'
import { AccountsProvider } from '#/features/exchange-accounts/context'
import { AccountsHeader } from '#/features/exchange-accounts/components/header'
import { AccountsTable } from '#/features/exchange-accounts/components/table'
import { AccountsDialogs } from '#/features/exchange-accounts/components/dialogs'

export const Route = createFileRoute('/dashboard/exchange-accounts')({
  component: ExchangeAccounts,
})

function ExchangeAccounts() {
  return (
    <AccountsProvider>
      <AccountsHeader />
      <AccountsTable />
      <AccountsDialogs />
    </AccountsProvider>
  )
}
