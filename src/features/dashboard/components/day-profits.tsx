import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Profit } from "@/components/profit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  useDayProfitsData,
  useMonthSelection,
} from "@/features/dashboard/hooks/useDayProfits";
import { getDayProfits } from "@/features/dashboard/services/dashboard-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { useDayProfitsContext } from "../context/day-profits-context";
import { DayProfitsCell } from "./day-profits-cell";
import { WeekSummaryCell } from "./week-summary-cell";

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
  const { selectDayProfit } = useDayProfitsContext();

  const { selectedAccount, isStoreLoaded, coin } = useUserConfigStore();

  const START_DATE = selectedAccount?.earliestTradeDatePerCoin?.[coin];

  const {
    selectedMonth,
    handleNextMonth,
    handlePrevMonth,
    isPreviousMonth,
    isCurrentMonth,
    monthValue,
  } = useMonthSelection(START_DATE as string);

  const { data, isLoading } = useQuery({
    queryKey: ["day-profits", selectedAccount?._id, coin, monthValue],
    queryFn: () =>
      getDayProfits({
        accountId: selectedAccount!._id,
        coin,
        month: monthValue,
      }),
    enabled: isStoreLoaded && !!selectedAccount?._id,
  });

  const { calendarData, weeklySummaries, monthlySummary } = useDayProfitsData({
    data: data || [],
    month: monthValue,
  });

  console.log({
    calendarData,
    weeklySummaries,
    monthlySummary,
  });

  return (
    <Card className="col-span-2 gap-3">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
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

              <h1 className="text-lg sm:text-xl font-semibold">
                {selectedMonth.name}
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
        <CardAction className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <span className="font-medium">{t("monthly_stats")}:</span>
          <Profit amount={monthlySummary.totalNetProfit} coin={coin} />
          <Badge variant="outline">
            {monthlySummary.daysTraded} {t("total_days")}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="relative w-full overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Spinner className="size-10" />
            </div>
          )}

          <div className="grid grid-cols-7 md:grid-cols-8 gap-3">
            <div className="grid grid-cols-7 col-span-7 gap-1">
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
                <DayProfitsCell
                  key={index.toString()}
                  {...item}
                  coin={coin}
                  onClick={() => selectDayProfit(item)}
                />
              ))}
            </div>
            <div className="gap-1 hidden invisible md:grid md:visible">
              <div className="h-8" />
              {weeklySummaries.map((summary, index) => (
                <WeekSummaryCell
                  key={index.toString()}
                  {...summary}
                  coin={coin}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
