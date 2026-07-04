import type { ExchangeAccount } from '#/features/exchange-accounts/schema'

/** Public-facing account — no credentials exposed. */
export type AccountItem = Omit<ExchangeAccount, 'apiKey' | 'secretKey'>

export type AccountsDialogType = 'add' | 'edit' | 'delete'
