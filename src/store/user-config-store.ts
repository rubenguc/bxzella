import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserConfig = {
  selectedAccountId: string;
  theme: "dark" | "light" | "system";
  setSelectedAccountId: (id: string) => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  startDate: number;
  endDate: number;
  updateDateRange: (startDate: number, endDate: number) => void;
};

export const useUserConfigStore = create<UserConfig>()(
  persist(
    (set) => ({
      selectedAccountId: "",
      theme: "system",
      setSelectedAccountId: (id: string) =>
        set((state) => ({ ...state, selectedAccountId: id })),
      setTheme: (theme: "dark" | "light" | "system") =>
        set((state) => ({ ...state, theme })),
      startDate: 0,
      endDate: 0,
      updateDateRange: (startDate: number, endDate: number) =>
        set((state) => ({ ...state, startDate, endDate })),
    }),
    {
      name: "user-config",
    },
  ),
);
