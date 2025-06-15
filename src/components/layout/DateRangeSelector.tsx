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
  const { startDate, endDate, updateDateRange, isInit } = useUserConfigStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const startMonth = useMemo(() => {
    if (!isInit) return new Date();

    if (startDate === 0) {
      const actualDate = new Date();
      return new Date(actualDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return new Date(startDate - 3 * ONE_MONTH_IN_MS);
  }, [isInit, startDate]);

  const endMonth = useMemo(() => {
    if (!isInit) return new Date();

    if (endDate === 0) {
      const actualDate = new Date();
      return new Date(actualDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return new Date(endDate + ONE_MONTH_IN_MS);
  }, [isInit, endDate]);

  useEffect(() => {
    if (!isInit) return;

    if (startDate === 0 && endDate === 0) {
      const actualDate = new Date();
      const sevenDaysAgo = new Date(
        actualDate.getTime() - 7 * 24 * 60 * 60 * 1000,
      );
      setDateRange({
        from: sevenDaysAgo,
        to: actualDate,
      });
      updateDateRange(
        sevenDaysAgo.getTime() as number,
        actualDate.getTime() as number,
      );
    }

    if (startDate !== 0 && endDate !== 0 && !dateRange?.from) {
      setDateRange({
        from: new Date(startDate),
        to: new Date(endDate),
      });
    }
  }, [dateRange, startDate, endDate, isInit]);

  const formattedStartDate = dateRange?.from
    ? format(dateRange!.from as Date, "MMM dd")
    : "";
  const formattedEndDate = dateRange?.to
    ? format(dateRange!.to as Date, "MMM dd")
    : "";

  const value = isInit ? `${formattedStartDate} - ${formattedEndDate}` : "";

  const onMenuChange = (value?: string) => {
    if (!value && dateRange?.from && dateRange?.to)
      updateDateRange(
        dateRange?.from?.getTime() as number,
        dateRange?.to?.getTime() as number,
      );
  };

  return (
    <Menubar onValueChange={onMenuChange}>
      <MenubarMenu>
        <MenubarTrigger className="data-[state=open]:bg-transparent">
          <div className="relative flex items-center">
            <CalendarIcon size={17} className="opacity-50" />
            <Input
              readOnly
              className="max-w-32 cursor-pointer select-none border-none  shadow-none focus-visible:shadow-none focus-visible:ring-0"
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
