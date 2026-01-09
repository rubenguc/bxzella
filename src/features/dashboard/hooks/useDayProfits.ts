import { format } from "date-fns";
import { useMemo, useState } from "react";
import type { CalendarCell } from "@/features/dashboard/interfaces/dashboard-interfaces";
import type { GetDayProfitsWithTradesResponse } from "@/features/day-log/interfaces/day-log-interfaces";

export interface WeekSummary {
  weekNumber: number;
  totalNetProfit: number;
  totalTrades: number;
  daysTraded: number;
}

export interface MonthlySummary {
  totalNetProfit: number;
  daysTraded: number;
}

export const useMonthSelection = (startDate?: string | undefined) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM");
  });

  const monthsList = useMemo(() => {
    const today = new Date();
    const months = [];

    if (!startDate) {
      const monthDate = new Date(today.getFullYear(), today.getMonth(), 1);
      months.push({
        name: monthDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        shortName: monthDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        value: format(monthDate, "yyyy-MM"),
        date: monthDate,
      });
    } else {
      const startDateTime = new Date(startDate);

      const timezoneOffset = startDateTime.getTimezoneOffset() * 60000;
      const adjustedStartDate = new Date(
        startDateTime.getTime() - timezoneOffset,
      );

      const startYear = adjustedStartDate.getFullYear();
      const startMonth = adjustedStartDate.getMonth();

      let currentDate = new Date(startYear, startMonth, 1);
      const now = new Date();

      while (
        currentDate.getFullYear() < now.getFullYear() ||
        (currentDate.getFullYear() === now.getFullYear() &&
          currentDate.getMonth() <= now.getMonth())
      ) {
        months.push({
          name: currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          shortName: currentDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          value: format(currentDate, "yyyy-MM"),
          date: currentDate,
        });

        currentDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1,
        );
      }
    }

    return months;
  }, [startDate]);

  const selectedMonthObject = useMemo(() => {
    return (
      monthsList.find((month) => month.value === selectedMonth) ||
      monthsList[monthsList.length - 1]
    );
  }, [monthsList, selectedMonth]);

  const [selectedYear, selectedMonthNum] = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return [year, month - 1];
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    if (!startDate) return;

    const selectedDate = new Date(selectedYear, selectedMonthNum, 1);
    const prevMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1,
    );
    setSelectedMonth(format(prevMonth, "yyyy-MM"));
  };

  const handleNextMonth = () => {
    if (!startDate) return;

    const selectedDate = new Date(selectedYear, selectedMonthNum, 1);
    const nextMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      1,
    );
    setSelectedMonth(format(nextMonth, "yyyy-MM"));
  };

  let isEarliestMonth = false;
  if (startDate) {
    const startDateTime = new Date(startDate);
    const timezoneOffset = startDateTime.getTimezoneOffset() * 60000;
    const adjustedStartDate = new Date(
      startDateTime.getTime() - timezoneOffset,
    );

    const startYear = adjustedStartDate.getFullYear();
    const startMonth = adjustedStartDate.getMonth();

    isEarliestMonth =
      selectedYear < startYear ||
      (selectedYear === startYear && selectedMonthNum <= startMonth);
  } else {
    isEarliestMonth = true;
  }

  const currentDate = new Date();
  const isCurrentMonth =
    selectedYear === currentDate.getFullYear() &&
    selectedMonthNum === currentDate.getMonth();

  return {
    selectedMonth: selectedMonthObject,
    handlePrevMonth,
    handleNextMonth,
    isPreviousMonth: isEarliestMonth,
    isCurrentMonth,
    monthValue: selectedMonth,
  };
};

export const useDayProfitsData = ({
  data,
  month,
}: {
  data: GetDayProfitsWithTradesResponse[];
  month: string;
}) => {
  const [selectedYear, selectedMonthNum] = useMemo(() => {
    if (!month) {
      const today = new Date();
      return [today.getFullYear(), today.getMonth()];
    }
    const [year, monthStr] = month.split("-").map(Number);
    return [year, monthStr - 1];
  }, [month]);

  const processCalendarData = useMemo(() => {
    const currentYear = selectedYear;
    const currentMonthNum = selectedMonthNum;

    const tradingMap = new Map();
    data.forEach((day) => {
      const dateParts = day.date.split("-");
      const dayOfMonth = parseInt(dateParts[2], 10);
      const monthNum = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[0], 10);

      if (year === currentYear && monthNum === currentMonthNum) {
        tradingMap.set(dayOfMonth, {
          amount: day.netPnL,
          trades: day.totalTrades,
          type: day.netPnL >= 0 ? "profit" : "loss",
          allTrades: day.trades,
        });
      }
    });

    const firstDayOfMonth = new Date(currentYear, currentMonthNum, 1);
    const startOfCalendar = new Date(firstDayOfMonth);
    startOfCalendar.setDate(
      startOfCalendar.getDate() - firstDayOfMonth.getDay(),
    );

    const calendarData: CalendarCell[] = [];
    const current = new Date(startOfCalendar);

    for (let i = 0; i < 42; i++) {
      const currentDayMonth = current.getMonth();
      const currentDayYear = current.getFullYear();
      const isCurrentMonth =
        currentDayMonth === currentMonthNum && currentDayYear === currentYear;
      const dayNum = current.getDate();

      if (isCurrentMonth) {
        const tradingInfo = tradingMap.get(dayNum);
        if (tradingInfo) {
          calendarData.push({
            date: dayNum,
            amount: tradingInfo.amount,
            trades: tradingInfo.trades,
            type: tradingInfo.type,
            allTrades: tradingInfo.allTrades,
            month: currentMonthNum,
          });
        } else {
          calendarData.push({
            date: dayNum,
            amount: null,
            trades: null,
          });
        }
      } else {
        calendarData.push({
          date: null,
          amount: null,
          trades: null,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return calendarData;
  }, [selectedYear, selectedMonthNum, data]);

  const weeklySummaries = useMemo(() => {
    const summaries: WeekSummary[] = [];

    for (let week = 0; week < 6; week++) {
      let totalNetProfit = 0;
      let totalTrades = 0;
      let daysTraded = 0;

      for (let day = 0; day < 7; day++) {
        const index = week * 7 + day;
        const cell = processCalendarData[index];

        if (cell && cell.date !== null && cell.amount !== null) {
          totalNetProfit += Number(cell.amount);
          totalTrades += cell.trades || 0;
          if (
            cell.amount !== 0 ||
            (cell.amount === 0 && cell.trades && cell.trades > 0)
          ) {
            daysTraded++;
          }
        }
      }

      summaries.push({
        weekNumber: week + 1,
        totalNetProfit,
        totalTrades,
        daysTraded,
      });
    }

    return summaries;
  }, [processCalendarData]);

  const monthlySummary = useMemo(() => {
    let totalNetProfit = 0;
    let daysTraded = 0;

    processCalendarData.forEach((cell) => {
      if (cell && cell.date !== null && cell.amount !== null) {
        totalNetProfit += Number(cell.amount);
        if (
          cell.amount !== 0 ||
          (cell.amount === 0 && cell.trades && cell.trades > 0)
        ) {
          daysTraded++;
        }
      }
    });

    return {
      totalNetProfit,
      daysTraded,
    };
  }, [processCalendarData]);

  return {
    calendarData: processCalendarData,
    weeklySummaries,
    monthlySummary,
  };
};
