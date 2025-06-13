import { useEffect, useState } from "react";
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

export function DateRangeSelector() {
  const { startDate, endDate, updateDateRange } = useUserConfigStore();
  const threeMonthsBefore = new Date(startDate - 3 * 30 * 24 * 60 * 60 * 1000);
  const monthAfter = new Date(startDate + 30 * 24 * 60 * 60 * 1000);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (startDate !== 0 && endDate !== 0 && !dateRange?.from) {
      setDateRange({
        from: new Date(startDate),
        to: new Date(endDate),
      });
    }
  }, [dateRange, startDate, endDate]);

  const formattedStartDate = dateRange?.from
    ? format(dateRange!.from as Date, "MMM dd")
    : "";
  const formattedEndDate = dateRange?.to
    ? format(dateRange!.to as Date, "MMM dd")
    : "";

  const value = `${formattedStartDate} - ${formattedEndDate}`;

  const onMenuChange = (value?: string) => {
    if (!value)
      updateDateRange(
        dateRange!.from?.getTime() as number,
        dateRange!.to?.getTime() as number,
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
            startMonth={threeMonthsBefore}
            endMonth={monthAfter}
            disabled={{
              before: threeMonthsBefore,
              after: new Date(),
            }}
          />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
