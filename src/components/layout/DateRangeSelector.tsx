import { useEffect, useMemo, useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";
import { DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useUserConfigStore } from "@/store/user-config-store";

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

export function DateRangeSelector() {
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

  const onMenuChange = (value?: string) => {
    if (!value && dateRange?.from && dateRange?.to)
      updateDateRange(dateRange?.from, dateRange?.to);
  };

  return (
    <Menubar onValueChange={onMenuChange} className="rounded-full">
      <MenubarMenu>
        <MenubarTrigger className="data-[state=open]:bg-transparent p-1">
          <div className="relative flex items-center">
            <CalendarIcon size={17} className="opacity-50" />
            <Input
              readOnly
              className="hidden md:block max-w-32 cursor-pointer select-none border-none  shadow-none focus-visible:shadow-none focus-visible:ring-0"
              value={value}
            />
          </div>
        </MenubarTrigger>
        <MenubarContent>
          <Calendar
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
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
