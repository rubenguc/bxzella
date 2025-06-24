import { TradeProfitPerDay } from "@/features/trades/interfaces/trades-interfaces";
import { startOfMonth } from "date-fns";
import { useMemo, useState } from "react";
import { CalendarCell } from "@/features/dashboard/interfaces/dashboard-interfaces";

export const useDayProfits = ({ data }: { data: TradeProfitPerDay[] }) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);

  const months = useMemo(() => {
    const today = new Date();

    const currentMonthStart = startOfMonth(today);
    const previousMonthStart = startOfMonth(
      new Date(
        currentMonthStart.getFullYear(),
        currentMonthStart.getMonth() - 1,
        1,
      ),
    );

    return [
      {
        name: previousMonthStart.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        shortName: previousMonthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        date: previousMonthStart,
      },
      {
        name: currentMonthStart.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        shortName: currentMonthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        date: currentMonthStart,
      },
    ];
  }, []);

  const processCalendarData = useMemo(() => {
    const selectedMonthDate = months[currentMonthIndex].date;
    const currentYear = selectedMonthDate.getFullYear();
    const currentMonthNum = selectedMonthDate.getMonth(); // getMonth() is 0-indexed

    // Create a map of trading data by date (day of the month)
    const tradingMap = new Map();
    data.forEach((day) => {
      // Directly parse the date string "yyyy-mm-dd"
      const dateParts = day._id.split("-");
      const dayOfMonth = parseInt(dateParts[2], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed

      // Ensure the parsed date belongs to the currently displayed month and year
      if (
        parseInt(dateParts[0], 10) === currentYear &&
        month === currentMonthNum
      ) {
        tradingMap.set(dayOfMonth, {
          amount: day.netProfit,
          trades: day.trades.length,
          type: day.netProfit >= 0 ? "profit" : "loss",
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
      const isCurrentMonth = current.getMonth() === currentMonthNum;
      const dayNum = current.getDate();

      if (isCurrentMonth) {
        const tradingInfo = tradingMap.get(dayNum);
        if (tradingInfo) {
          calendarData.push({
            date: dayNum,
            amount: tradingInfo.amount,
            trades: tradingInfo.trades,
            type: tradingInfo.type,
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
  }, [currentMonthIndex, data, months]);

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 1 : 0));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 1 ? 0 : 1));
  };

  const isPreviousMonth = currentMonthIndex === 0;
  const isCurrentMonth = currentMonthIndex === 1;

  const selectedMonth = months[currentMonthIndex];

  return {
    calendarData: processCalendarData,
    handlePrevMonth,
    handleNextMonth,
    isPreviousMonth,
    isCurrentMonth,
    selectedMonth,
  };
};
