import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import type { SubscriptionDialogType } from '#/features/ai-summary-subscriptions/types'
import type { SubscriptionWithAccount } from '#/features/ai-summary-subscriptions/types'

interface SubscriptionsContextValue {
  open: SubscriptionDialogType | null
  setOpen: (v: SubscriptionDialogType | null) => void
  currentRow: SubscriptionWithAccount | null
  setCurrentRow: React.Dispatch<React.SetStateAction<SubscriptionWithAccount | null>>
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null)

export function SubscriptionsProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState<SubscriptionDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<SubscriptionWithAccount | null>(null)

  return (
    <SubscriptionsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext)
  if (!ctx) throw new Error('useSubscriptions must be used within <SubscriptionsProvider>')
  return ctx
}
