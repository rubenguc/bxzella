import { useUserConfigStore } from "@/store/user-config-store";
import { useQuery } from "@tanstack/react-query";
import { getDayProfits } from "@/features/dashboard/services/dashboard-services";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDayProfits } from "@/features/dashboard/hooks/useDayProfits";
import { DayProfitsCell } from "./DayProfitsCell";

const daysOfWeekKeys = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function DayProfits() {
  const t = useTranslations("dashboard.day_profits");

  const { selectedAccountId, isStoreLoaded, coin } = useUserConfigStore();

  const { data } = useQuery({
    queryKey: ["day-profits", selectedAccountId, coin],
    queryFn: () =>
      getDayProfits({
        accountId: selectedAccountId,
        coin,
      }),
    enabled: isStoreLoaded && !!selectedAccountId,
  });

  const {
    calendarData,
    handleNextMonth,
    handlePrevMonth,
    isPreviousMonth,
    isCurrentMonth,
    selectedMonth,
  } = useDayProfits({
    data: data || [],
  });

  return (
    <Card className="col-span-2 gap-3">
      <CardTitle>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              disabled={isPreviousMonth}
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <h1 className="text-lg sm:text-xl font-semibold ">
              <span className="hidden sm:inline">{selectedMonth.name}</span>
              <span className="sm:hidden">{selectedMonth.shortName}</span>
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
        </div>
      </CardTitle>
      <CardContent>
        <div className="grid grid-cols-7 gap-0.5">
          {daysOfWeekKeys.map((day) => (
            <div
              key={day}
              className="h-8 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center"
            >
              <span className="font-medium text-xs sm:text-sm">
                <span className="hidden sm:inline">{t(`days.${day}`)}</span>
                <span className="sm:hidden">{t(`days_short.${day}`)}</span>
              </span>
            </div>
          ))}

          {calendarData.map((item, index) => (
            <DayProfitsCell key={index} {...item} coin={coin} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
