import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import type { StrategiesDialogType, StrategyWithStats } from '#/features/strategies/types'

interface StrategiesContextValue {
  open: StrategiesDialogType | null
  setOpen: (v: StrategiesDialogType | null) => void
  currentRow: StrategyWithStats | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StrategyWithStats | null>>
}

const StrategiesContext = createContext<StrategiesContextValue | null>(null)

export function StrategiesProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState<StrategiesDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<StrategyWithStats | null>(null)

  return (
    <StrategiesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StrategiesContext.Provider>
  )
}

export function useStrategies() {
  const ctx = useContext(StrategiesContext)
  if (!ctx) throw new Error('useStrategies must be used within <StrategiesProvider>')
  return ctx
}