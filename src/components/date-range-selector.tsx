import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { es } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useUserConfig } from "#/store/user-config";

const LOCALES: Record<string, typeof es | undefined> = {
  es,
};

export function DateRangeSelector() {
  const { startDate, endDate, updateDateRange, selectedAccount, coin } =
    useUserConfig();

  const earliestTradeDate = selectedAccount?.earliestTradeDatePerCoin?.[coin];
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Set initial date range from store or default to last 7 days
  useEffect(() => {
    if (!startDate && !endDate) {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      setDateRange({ from: sevenDaysAgo, to: now });
      updateDateRange(sevenDaysAgo, now);
    } else if (startDate && endDate && !dateRange?.from) {
      setDateRange({ from: startDate, to: endDate });
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedStartDate = dateRange?.from
    ? format(dateRange.from, "MMM dd")
    : "";
  const formattedEndDate = dateRange?.to ? format(dateRange.to, "MMM dd") : "";

  const value = `${
    dateRange?.from ? formattedStartDate : "-"
  } - ${formattedEndDate || "-"}`;

  const handleOpenChange = (open: boolean) => {
    if (!open && dateRange?.from && dateRange?.to) {
      updateDateRange(dateRange.from, dateRange.to);
    }
  };

  // Predefined date ranges
  const predefinedRanges = [
    {
      label: m["date_range_selector.today"](),
      range: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      label: m["date_range_selector.this_week"](),
      range: () => {
        const today = new Date();
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        return {
          from: startOfWeek(today, { weekStartsOn: 0 }),
          to: weekEnd > today ? today : weekEnd,
        };
      },
    },
    {
      label: m["date_range_selector.this_month"](),
      range: () => {
        const today = new Date();
        const monthEnd = endOfMonth(today);
        return {
          from: startOfMonth(today),
          to: monthEnd > today ? today : monthEnd,
        };
      },
    },
    {
      label: m["date_range_selector.last_30_days"](),
      range: () => {
        const today = new Date();
        return {
          from: subDays(today, 30),
          to: today,
        };
      },
    },
    {
      label: m["date_range_selector.last_month"](),
      range: () => {
        const today = new Date();
        const firstDayLastMonth = startOfMonth(subMonths(today, 1));
        const lastDayLastMonth = endOfMonth(subMonths(today, 1));
        return {
          from: firstDayLastMonth,
          to: lastDayLastMonth > today ? today : lastDayLastMonth,
        };
      },
    },
  ];

  const selectPredefinedRange = (
    rangeFn: () => { from: Date; to: Date },
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const range = rangeFn();
    setDateRange(range);
  };

  const locale = LOCALES[navigator.language.split("-")[0]];
  const startMonth = earliestTradeDate
    ? new Date(earliestTradeDate)
    : subDays(new Date(), 30);

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1 rounded-xl">
          <CalendarIcon className="size-4 opacity-50" />
          <span className="hidden md:block text-sm">{value}</span>
          <ChevronDown className="hidden md:block size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex">
        <div className="flex-1">
          <Calendar
            locale={locale}
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            startMonth={startMonth}
            endMonth={new Date()}
            disabled={[{ before: startMonth }, { after: new Date() }]}
            showOutsideDays
          />
        </div>
        <div className="w-fit border-l p-1">
          {predefinedRanges.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="cursor-pointer"
              onClick={(e) => selectPredefinedRange(item.range, e)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
