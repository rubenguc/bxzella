import { format } from "date-fns";
import { useMemo, useState } from "react";
import type { CalendarCell } from "@/features/dashboard/interfaces/dashboard-interfaces";
import type { TradeProfitPerDay } from "@/features/trades/interfaces/trades-interfaces";

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

// Hook to manage month selection state
export const useMonthSelection = () => {
  // Set default to current month
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM"); // Default to current month in "YYYY-MM" format
  });

  // Generate the last 5 months for minimum query range
  const monthsList = useMemo(() => {
    const today = new Date();
    const months = [];

    // Generate 5 months back from current month (5 months including current)
    for (let i = 4; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: monthDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        shortName: monthDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        value: format(monthDate, "yyyy-MM"), // Format as "YYYY-MM"
        date: monthDate,
      });
    }

    return months;
  }, []);

  // Find the selected month object based on the selectedMonth value
  const selectedMonthObject = useMemo(() => {
    return (
      monthsList.find((month) => month.value === selectedMonth) ||
      monthsList[monthsList.length - 1]
    );
  }, [monthsList, selectedMonth]);

  // Parse selected month to get year and month number
  const [selectedYear, selectedMonthNum] = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return [year, month - 1]; // Convert to 0-indexed month
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    const selectedDate = new Date(selectedYear, selectedMonthNum, 1);
    const prevMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1,
    );
    setSelectedMonth(format(prevMonth, "yyyy-MM"));
  };

  const handleNextMonth = () => {
    const selectedDate = new Date(selectedYear, selectedMonthNum, 1);
    const nextMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      1,
    );
    setSelectedMonth(format(nextMonth, "yyyy-MM"));
  };

  // Check if selected month is the earliest available month (5 months ago)
  const earliestDate = new Date();
  earliestDate.setMonth(earliestDate.getMonth() - 3); // 5 months including current (so we can go back 4 months from current)
  const isEarliestMonth =
    selectedYear < earliestDate.getFullYear() ||
    (selectedYear === earliestDate.getFullYear() &&
      selectedMonthNum < earliestDate.getMonth());

  // Check if selected month is the current month
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

// Hook to process data for a specific month
export const useDayProfitsData = ({
  data,
  month,
}: {
  data: TradeProfitPerDay[];
  month: string;
}) => {
  // Parse the month string to get year and month number
  const [selectedYear, selectedMonthNum] = useMemo(() => {
    if (!month) {
      const today = new Date();
      return [today.getFullYear(), today.getMonth()];
    }
    const [year, monthStr] = month.split("-").map(Number);
    return [year, monthStr - 1]; // Convert to 0-indexed month
  }, [month]);

  const processCalendarData = useMemo(() => {
    const currentYear = selectedYear;
    const currentMonthNum = selectedMonthNum;

    // Create a map of trading data by date (day of the month)
    const tradingMap = new Map();
    data.forEach((day) => {
      // Directly parse the date string "yyyy-mm-dd"
      const dateParts = day._id.split("-");
      const dayOfMonth = parseInt(dateParts[2], 10);
      const monthNum = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(dateParts[0], 10);

      // Ensure the parsed date belongs to the currently displayed month and year
      if (year === currentYear && monthNum === currentMonthNum) {
        tradingMap.set(dayOfMonth, {
          amount: day.netProfit,
          trades: day.trades.length,
          type: day.netProfit >= 0 ? "profit" : "loss",
          allTrades: day.trades,
        });
      }
    });

    // Generate the calendar for the selected month
    const firstDayOfMonth = new Date(currentYear, currentMonthNum, 1);
    const startOfCalendar = new Date(firstDayOfMonth);
    startOfCalendar.setDate(
      startOfCalendar.getDate() - firstDayOfMonth.getDay(),
    );

    const calendarData: CalendarCell[] = [];
    const current = new Date(startOfCalendar);

    // Generate 42 cells (6 weeks x 7 days)
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

    // Process each week (6 weeks)
    for (let week = 0; week < 6; week++) {
      let totalNetProfit = 0;
      let totalTrades = 0;
      let daysTraded = 0;

      // Process each day in the week (7 days)
      for (let day = 0; day < 7; day++) {
        const index = week * 7 + day;
        const cell = processCalendarData[index];

        if (cell && cell.date !== null && cell.amount !== null) {
          totalNetProfit += cell.amount;
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
    // Calculate total net profit and days traded for the month
    let totalNetProfit = 0;
    let daysTraded = 0;

    processCalendarData.forEach((cell) => {
      if (cell && cell.date !== null && cell.amount !== null) {
        totalNetProfit += cell.amount;
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
