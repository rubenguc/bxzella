import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { Button } from "#/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { getLocale } from "#/paraglide/runtime";
import { m } from "#/paraglide/messages";
import { useUserConfig } from "#/store/user-config";
import { getDailyPnl } from "#/features/dashboard/daily-pnl-service";
import { formatDecimal } from "#/lib/format-decimal";
import { DailyPnlCell } from "./daily-pnl-cell";
import { DailyPnlWeekSummary } from "./daily-pnl-week-summary";
import { DailyPnlDialog } from "./daily-pnl-dialog";
import type {
  CalendarCell,
  DailyPnlEntry,
  WeekSummary,
} from "#/features/dashboard/types";

function useDaysOfWeek() {
  return useMemo(() => {
    const locale = getLocale();
    // Reference week starting Sun (Jan 7, 2024 = Sunday)
    const ref = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ref);
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: "short" });
    });
  }, []);
}

export function DailyPnlCalendar() {
  const { selectedAccount, coin } = useUserConfig();
  const [monthValue, setMonthValue] = useState(() =>
    format(new Date(), "yyyy-MM"),
  );
  const [selectedDay, setSelectedDay] = useState<CalendarCell | null>(null);
  const daysOfWeek = useDaysOfWeek();

  const [year, monthNum] = useMemo(() => {
    const [y, m] = monthValue.split("-").map(Number);
    return [y, m - 1];
  }, [monthValue]);

  const firstDayOfMonth = new Date(year, monthNum, 1);
  const monthName = firstDayOfMonth.toLocaleDateString(getLocale(), {
    month: "long",
    year: "numeric",
  });

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return year === now.getFullYear() && monthNum === now.getMonth();
  }, [year, monthNum]);

  const earliestDate = selectedAccount?.earliestTradeDatePerCoin?.[coin];
  const earliestMonth = useMemo(() => {
    if (!earliestDate) return null;
    const d = new Date(earliestDate);
    return format(d, "yyyy-MM");
  }, [earliestDate]);

  const isEarliestMonth = useMemo(() => {
    if (!earliestMonth) return false;
    return monthValue <= earliestMonth;
  }, [monthValue, earliestMonth]);

  const handlePrevMonth = () => {
    const prev = new Date(year, monthNum - 1, 1);
    setMonthValue(format(prev, "yyyy-MM"));
  };

  const handleNextMonth = () => {
    const next = new Date(year, monthNum + 1, 1);
    setMonthValue(format(next, "yyyy-MM"));
  };

  const { data, isLoading } = useQuery({
    queryKey: ["daily-pnl", selectedAccount?.id, coin, monthValue],
    queryFn: () =>
      getDailyPnl({
        accountId: selectedAccount!.id,
        coin,
        month: monthValue,
      }),
    enabled: !!selectedAccount?.id,
  });

  const { calendarData, weeklySummaries, monthlySummary } = useMemo(() => {
    const entries = data ?? [];

    const tradingMap = new Map<number, DailyPnlEntry>();
    entries.forEach((entry) => {
      const day = parseInt(entry.date.split("-")[2], 10);
      tradingMap.set(day, entry);
    });

    const startOfCalendar = new Date(firstDayOfMonth);
    startOfCalendar.setDate(
      startOfCalendar.getDate() - firstDayOfMonth.getDay(),
    );

    const cells: CalendarCell[] = [];
    const current = new Date(startOfCalendar);

    for (let i = 0; i < 42; i++) {
      const cellMonth = current.getMonth();
      const cellYear = current.getFullYear();
      const isSameMonth = cellMonth === monthNum && cellYear === year;
      const dayNum = current.getDate();

      if (isSameMonth) {
        const tradingInfo = tradingMap.get(dayNum);
        if (tradingInfo) {
          cells.push({
            date: dayNum,
            amount: tradingInfo.netPnL,
            trades: tradingInfo.totalTrades,
            type: tradingInfo.netPnL >= 0 ? "profit" : "loss",
            allTrades: tradingInfo.trades,
            month: monthNum,
          });
        } else {
          cells.push({ date: dayNum, amount: null, trades: null });
        }
      } else {
        cells.push({ date: null, amount: null, trades: null });
      }

      current.setDate(current.getDate() + 1);
    }

    // Remove trailing empty weeks
    let lastValid = cells.length - 1;
    while (lastValid >= 0) {
      const weekStart = Math.floor(lastValid / 7) * 7;
      const weekCells = cells.slice(weekStart, weekStart + 7);
      if (weekCells.some((c) => c.date !== null)) break;
      lastValid = weekStart - 1;
    }

    const trimmed = cells.slice(0, lastValid + 1);
    const totalWeeks = Math.ceil(trimmed.length / 7);
    let totalNetProfit = 0;
    let daysTraded = 0;
    const summaries: WeekSummary[] = [];

    for (let w = 0; w < totalWeeks; w++) {
      let weekProfit = 0;
      let weekDays = 0;

      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d;
        const cell = trimmed[idx];
        if (cell && cell.date !== null && cell.amount !== null) {
          weekProfit += Number(cell.amount);
          if (cell.amount !== 0 || (cell.trades ?? 0) > 0) {
            weekDays++;
          }
        }
      }

      summaries.push({
        weekNumber: w + 1,
        totalNetProfit: weekProfit,
        totalTrades: entries.reduce((sum, e) => sum + e.totalTrades, 0),
        daysTraded: weekDays,
      });
    }

    summaries.forEach((w) => {
      totalNetProfit += w.totalNetProfit;
      daysTraded += w.daysTraded;
    });

    return {
      calendarData: trimmed,
      weeklySummaries: summaries,
      monthlySummary: { totalNetProfit, daysTraded },
    };
  }, [data, year, monthNum, firstDayOfMonth]);

  return (
    <>
      <Card>
        <CardHeader className="px-2 md:px-6">
          <CardTitle>
            <div className="flex items-center gap-1">
              <Button
                disabled={isEarliestMonth || !earliestDate}
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <h1 className="text-lg sm:text-xl font-semibold">
                {monthName}
              </h1>

              <Button
                disabled={isCurrentMonth}
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardAction className="flex items-center gap-2 text-xs max-md:col-span-2 max-md:row-start-2 max-md:justify-self-start">
            <span className="text-muted-foreground">{m['dashboard.day_profits.monthly_stats']()}:</span>
            <span
              className={
                monthlySummary.totalNetProfit >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {formatDecimal(monthlySummary.totalNetProfit, { suffix: "USDT" })}
            </span>
            <Badge variant="outline">{monthlySummary.daysTraded} {m['dashboard.day_profits.total_days']()}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden px-2 md:px-6">
          <div className="relative w-full overflow-auto">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <p className="text-muted-foreground">{m['common_messages.loading']()}</p>
              </div>
            ) : null}

            <div className="hidden md:grid md:grid-cols-[1fr_auto] gap-3">
              {/* Calendar grid — left */}
              <div className="grid grid-cols-7 gap-0.5 md:gap-1 content-start">
                {daysOfWeek.map((day, i) => (
                  <div
                    key={i}
                    className="h-8 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center"
                  >
                    <span className="font-medium text-xs sm:text-sm">
                      {day}
                    </span>
                  </div>
                ))}
                {calendarData.map((item, index) => (
                  <DailyPnlCell
                    key={index}
                    {...item}
                    onClick={() => setSelectedDay(item)}
                  />
                ))}
              </div>
              {/* Weekly summaries — right */}
              <div className="grid gap-0.5 md:gap-1 content-start">
                <div className="h-8" />
                {weeklySummaries.map((summary, index) => (
                  <DailyPnlWeekSummary key={index} {...summary} />
                ))}
              </div>
            </div>
            {/* Mobile layout: stacked */}
            <div className="md:hidden grid grid-cols-7 gap-0.5">
              {daysOfWeek.map((day, i) => (
                <div
                  key={i}
                  className="h-8 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center"
                >
                  <span className="font-medium text-xs">{day}</span>
                </div>
              ))}
              {calendarData.map((item, index) => (
                <DailyPnlCell
                  key={index}
                  {...item}
                  onClick={() => setSelectedDay(item)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <DailyPnlDialog day={selectedDay} onClose={() => setSelectedDay(null)} />
    </>
  );
}
