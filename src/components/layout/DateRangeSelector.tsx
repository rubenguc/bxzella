import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useUserConfigStore } from "@/store/user-config-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { es, enUS } from "react-day-picker/locale";

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

const LOCALES = {
  es,
  en: enUS,
};

export function DateRangeSelector() {
  const locale = useLocale();
  const t = useTranslations("date_range_selector");

  const { startDate, endDate, updateDateRange, isStoreLoaded } =
    useUserConfigStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const startMonth = useMemo(() => {
    if (!isStoreLoaded) return new Date();

    if (!startDate) {
      const actualDate = new Date();
      return new Date(actualDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return new Date(startDate.getTime() - 3 * ONE_MONTH_IN_MS);
  }, [isStoreLoaded, startDate]);

  const endMonth = useMemo(() => {
    if (!isStoreLoaded) return new Date();

    if (!endDate) {
      const actualDate = new Date();
      return new Date(actualDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return new Date(endDate.getTime() + ONE_MONTH_IN_MS * 2);
  }, [isStoreLoaded, endDate]);

  useEffect(() => {
    if (!isStoreLoaded) return;

    if (!startDate && !endDate) {
      const actualDate = new Date();
      const sevenDaysAgo = new Date(
        actualDate.getTime() - 7 * 24 * 60 * 60 * 1000,
      );
      setDateRange({
        from: sevenDaysAgo,
        to: actualDate,
      });
      updateDateRange(sevenDaysAgo, actualDate);
    }

    if (!!startDate && !!endDate && !dateRange?.from) {
      setDateRange({
        from: startDate,
        to: endDate,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, startDate, endDate, isStoreLoaded]);

  const formattedStartDate = dateRange?.from
    ? format(dateRange!.from as Date, "MMM dd")
    : "";
  const formattedEndDate = dateRange?.to
    ? format(dateRange!.to as Date, "MMM dd")
    : "";

  const value = isStoreLoaded
    ? `${formattedStartDate} - ${formattedEndDate}`
    : "";

  const updateRange = (isOpen: boolean) => {
    if (!isOpen && dateRange?.from && dateRange?.to)
      updateDateRange(dateRange?.from, dateRange?.to);
  };

  // Predefined date ranges
  const predefinedRanges = [
    {
      label: t("today"),
      range: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      label: t("this_week"),
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
      label: t("this_month"),
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
      label: t("last_30_days"),
      range: () => {
        const today = new Date();
        return {
          from: subDays(today, 30),
          to: today,
        };
      },
    },
    {
      label: t("last_month"),
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
    // Prevent the dropdown from closing when clicking a predefined range
    e.preventDefault();
    e.stopPropagation();

    const range = rangeFn();
    setDateRange(range);
  };

  return (
    <DropdownMenu onOpenChange={updateRange}>
      <DropdownMenuTrigger className="px-2 rounded-xl h-9 min-w-9  bg-card relative flex items-center outline dark:outline-transparent hover:outline-primary aria-expanded:outline-primary">
        <CalendarIcon size={17} className="opacity-50" />
        <Input
          readOnly
          className="hidden px-1 py-0 md:block max-w-30 cursor-pointer select-none border-none shadow-none bg-transparent!"
          value={value}
        />
        <ChevronDown className="hidden md:block ph-4 w-4 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex">
        <div className="flex-1">
          <Calendar
            locale={LOCALES[locale as "es" | "en"] || enUS}
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            startMonth={startMonth}
            endMonth={endMonth}
            disabled={{
              before: startMonth,
              after: new Date(),
            }}
          />
        </div>
        <div className="w-fit border-l p-1 bg-background">
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
