import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccountItem } from '#/features/exchange-accounts/types'
import type { Coin } from '#/features/exchange-providers/types'

interface UserConfig {
  /** Currently selected account (persisted across sessions). */
  selectedAccount: AccountItem | null
  /** Currently selected coin/market. */
  coin: Coin

  /** Dashboard date-range filter. */
  startDate: Date | null
  endDate: Date | null

  /** Cached trade chart timeframe (e.g. "1h", "4h", "1d"). */
  tradeChartTimeframe: string

  setSelectedAccount: (account: AccountItem | null) => void
  setCoin: (coin: Coin) => void

  updateDateRange: (startDate: Date | null, endDate: Date | null) => void

  /**
   * Stores last sync timestamp for the current coin inside
   * `selectedAccount.lastSyncPerCoin`.
   */
  updateLastSyncTime: (time: number) => void

  /**
   * Stores earliest trade date for the current coin inside
   * `selectedAccount.earliestTradeDatePerCoin`.
   */
  updateEarliestTradeDate: (date: string) => void

  /** Resets all state to defaults (keeps the persisted account/coin). */
  cleanStore: () => void

  setTradeChartTimeframe: (timeframe: string) => void
}

const DEFAULT_STATE: Pick<
  UserConfig,
  'startDate' | 'endDate' | 'tradeChartTimeframe'
> = {
  startDate: null,
  endDate: null,
  tradeChartTimeframe: '1h',
}

export const useUserConfig = create<UserConfig>()(
  persist(
    (set) => ({
      selectedAccount: null,
      coin: 'USDT',
      ...DEFAULT_STATE,

      setSelectedAccount: (account) =>
        set({ selectedAccount: account, coin: 'USDT' }),

      setCoin: (coin) => set({ coin }),

      updateDateRange: (startDate, endDate) => set({ startDate, endDate }),

      updateLastSyncTime: (time) =>
        set((state) => ({
          selectedAccount: state.selectedAccount
            ? {
                ...state.selectedAccount,
                lastSyncPerCoin: {
                  ...state.selectedAccount.lastSyncPerCoin,
                  [state.coin]: time,
                },
              }
            : null,
        })),

      updateEarliestTradeDate: (date) =>
        set((state) => ({
          selectedAccount: state.selectedAccount
            ? {
                ...state.selectedAccount,
                earliestTradeDatePerCoin: {
                  ...state.selectedAccount.earliestTradeDatePerCoin,
                  [state.coin]: date,
                },
              }
            : null,
        })),

      cleanStore: () =>
        set((state) => ({ ...state, ...DEFAULT_STATE })),

      setTradeChartTimeframe: (timeframe) =>
        set({ tradeChartTimeframe: timeframe }),
    }),
    {
      name: 'bxzella-user-config',
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Parse dates from JSON strings back to Date objects
        const parsedStartDate = state.startDate
          ? new Date(state.startDate)
          : null
        const parsedEndDate = state.endDate
          ? new Date(state.endDate)
          : null
        state.updateDateRange(parsedStartDate, parsedEndDate)

        // Ensure tradeChartTimeframe has a default
        state.setTradeChartTimeframe(state.tradeChartTimeframe || '1h')
      },
    },
  ),
)
