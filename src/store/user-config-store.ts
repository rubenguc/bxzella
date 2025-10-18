import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Coin, Theme } from "@/interfaces/global-interfaces";

type UserConfig = {
  selectedAccountId: string;
  theme: Theme;
  setSelectedAccountId: (id: string) => void;
  setTheme: (theme: Theme) => void;
  startDate: Date | null;
  endDate: Date | null;
  updateDateRange: (startDate: Date | null, endDate: Date | null) => void;
  isStoreLoaded: boolean;
  setHasHydrated: (state: boolean) => void;
  coin: Coin;
  setCoin: (coin: Coin) => void;
};

export const useUserConfigStore = create<UserConfig>()(
  persist(
    (set) => ({
      selectedAccountId: "",
      theme: "system",
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),
      setTheme: (theme) => set({ theme }),
      startDate: null,
      endDate: null,
      updateDateRange: (startDate, endDate) => set({ startDate, endDate }),
      isStoreLoaded: false,
      coin: "USDT",
      setCoin: (coin) => set({ coin }),
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
