import { useEffect, useMemo, useState } from "react";

import { DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useUserConfigStore } from "@/store/user-config-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLocale } from "next-intl";
import { es, enUS } from "react-day-picker/locale";

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

const LOCALES = {
  es,
  en: enUS,
};

export function DateRangeSelector() {
  const locale = useLocale();

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

    return new Date(endDate.getTime() + ONE_MONTH_IN_MS);
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

  return (
    <DropdownMenu onOpenChange={updateRange}>
      <DropdownMenuTrigger asChild className="px-2 border rounded-full h-9">
        <div className="relative flex items-center">
          <CalendarIcon size={17} className="opacity-50" />
          <Input
            readOnly
            className="hidden px-1 py-0 md:block max-w-28 cursor-pointer select-none border-none shadow-none bg-transparent!"
            value={value}
          />
          <ChevronDown className="hidden md:block ph-4 w-4 opacity-50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
