"use client";

import { createContext, useContext, useState } from "react";
import { DayProfitsDialog } from "../components/day-profits-dialog";
import type { CalendarCell } from "../interfaces/dashboard-interfaces";

interface DayProfitsContextProps {
  selectDayProfit: (day: CalendarCell | null) => void;
  dayProfit: CalendarCell | null;
}

const DayProfitsContext = createContext<DayProfitsContextProps>({
  selectDayProfit: () => {},
  dayProfit: null,
});

export default function DayProfitsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedDayProfit, setSelectedDayProfit] =
    useState<CalendarCell | null>(null);

  const selectDayProfit = (day: CalendarCell | null) => {
    setSelectedDayProfit(day);
  };

  return (
    <DayProfitsContext.Provider
      value={{ selectDayProfit, dayProfit: selectedDayProfit }}
    >
      {children}
      <DayProfitsDialog />
    </DayProfitsContext.Provider>
  );
}

export const useDayProfitsContext = () => {
  const context = useContext(DayProfitsContext);
  if (!context) {
    throw new Error("useDayProfits must be used within a DayProfitsProvider");
  }
  return context;
};
