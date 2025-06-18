import { create } from "zustand";
import { persist } from "zustand/middleware";

type Coin = "VST" | "USDT";

type UserConfig = {
  selectedAccountId: string;
  theme: "dark" | "light" | "system";
  setSelectedAccountId: (id: string) => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
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
      setSelectedAccountId: (id: string) => set({ selectedAccountId: id }),
      setTheme: (theme: "dark" | "light" | "system") => set({ theme }),
      startDate: null,
      endDate: null,
      updateDateRange: (startDate: Date | null, endDate: Date | null) =>
        set({ startDate, endDate }),
      isStoreLoaded: false,
      coin: "VST",
      setCoin: (coin: Coin) => set({ coin }),
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
