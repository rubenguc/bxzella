import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SelectedAccount } from "@/features/accounts/interfaces/accounts-interfaces";
import type {
  Coin,
  DayProfitsChartMode,
  Theme,
} from "@/interfaces/global-interfaces";

type UserConfig = {
  selectedAccount: SelectedAccount | null;
  theme: Theme;
  setSelectedAccount: (account: SelectedAccount | null) => void;
  setTheme: (theme: Theme) => void;
  startDate: Date | null;
  endDate: Date | null;
  updateDateRange: (startDate: Date | null, endDate: Date | null) => void;
  isStoreLoaded: boolean;
  setHasHydrated: (state: boolean) => void;
  coin: Coin;
  setCoin: (coin: Coin) => void;
  dayProfitsChartMode: DayProfitsChartMode;
  setDayProfitsChartMode: (mode: DayProfitsChartMode) => void;
  updateLastSyncTime: (time: number) => void;
  updateEarliestTradeDate: (date: string) => void;
};

export const useUserConfigStore = create<UserConfig>()(
  persist(
    (set) => ({
      dayProfitsChartMode: "area",
      selectedAccount: null,
      theme: "system",
      setSelectedAccount: (account) => set({ selectedAccount: account }),
      setTheme: (theme) => set({ theme }),
      startDate: null,
      endDate: null,
      updateDateRange: (startDate, endDate) => set({ startDate, endDate }),
      isStoreLoaded: false,
      coin: "USDT",
      setCoin: (coin) => set({ coin }),
      setDayProfitsChartMode: (mode: DayProfitsChartMode) =>
        set({ dayProfitsChartMode: mode }),
      updateLastSyncTime: (time: number) =>
        set((state) => ({
          ...state,
          selectedAccount: {
            ...(state.selectedAccount as SelectedAccount),
            lastSyncPerCoin: {
              ...state.selectedAccount?.lastSyncPerCoin,
              [state.coin]: time,
            },
          },
        })),
      updateEarliestTradeDate: (date: string) =>
        set((state) => ({
          ...state,
          selectedAccount: {
            ...(state.selectedAccount as SelectedAccount),
            earliestTradeDatePerCoin: {
              ...state.selectedAccount?.earliestTradeDatePerCoin,
              [state.coin]: date,
            },
          },
        })),
      setHasHydrated: (state) => {
        set({
          isStoreLoaded: state,
        });
      },
    }),
    {
      name: "user-config",
      onRehydrateStorage: () => {
        return (state) => {
          const parsedStartDate = state?.startDate
            ? new Date(state.startDate)
            : null;
          const parsedEndDate = state?.endDate ? new Date(state.endDate) : null;
          state?.updateDateRange(parsedStartDate, parsedEndDate);
          state?.setHasHydrated(true);
        };
      },
    },
  ),
);
