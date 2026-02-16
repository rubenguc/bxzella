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
  cleanStore: () => void;
  tradeChartTimeframe: string;
  setTradeChartTimeframe: (timeframe: string) => void;
};

const DEFAULT_STATE: Pick<
  UserConfig,
  | "dayProfitsChartMode"
  | "selectedAccount"
  | "theme"
  | "startDate"
  | "endDate"
  | "isStoreLoaded"
  | "coin"
  | "tradeChartTimeframe"
> = {
  dayProfitsChartMode: "area",
  selectedAccount: null,
  theme: "system",
  startDate: null,
  endDate: null,
  isStoreLoaded: false,
  coin: "USDT",
  tradeChartTimeframe: "1h",
};

export const useUserConfigStore = create<UserConfig>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setSelectedAccount: (account) =>
        set({ selectedAccount: account, coin: "USDT" }),
      setTheme: (theme) => set({ theme }),
      updateDateRange: (startDate, endDate) => set({ startDate, endDate }),
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
      cleanStore: () => set((state) => ({ ...state, ...DEFAULT_STATE })),
      setTradeChartTimeframe: (timeframe: string) =>
        set((state) => ({
          ...state,
          tradeChartTimeframe: timeframe,
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

          // Default Date range
          const parsedEndDate = state?.endDate ? new Date(state.endDate) : null;
          state?.updateDateRange(parsedStartDate, parsedEndDate);

          // Default Trade Chart Timeframe
          const parsedTradeChartTimeframe = state?.tradeChartTimeframe || "1h";
          state?.setTradeChartTimeframe(parsedTradeChartTimeframe);

          state?.setHasHydrated(true);
        };
      },
    },
  ),
);
