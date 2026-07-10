import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import type { AccountsDialogType, AccountItem } from '#/features/exchange-accounts/types'

interface AccountsContextValue {
  open: AccountsDialogType | null
  setOpen: (v: AccountsDialogType | null) => void
  currentRow: AccountItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountItem | null>>
}

const AccountsContext = createContext<AccountsContextValue | null>(null)

export function AccountsProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState<AccountsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<AccountItem | null>(null)

  return (
    <AccountsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  const ctx = useContext(AccountsContext)
  if (!ctx) throw new Error('useAccounts must be used within <AccountsProvider>')
  return ctx
}
