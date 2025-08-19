import { useUserConfigStore } from "@/store/user-config-store";
import { useQuery } from "@tanstack/react-query";
import { getDayProfits } from "@/features/dashboard/services/dashboard-services";
import { useTranslations } from "next-intl";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDayProfits } from "@/features/dashboard/hooks/useDayProfits";
import { DayProfitsCell } from "./day-profits-cell";
import { WeekSummaryCell } from "./week-summary-cell";
import { Badge } from "@/components/ui/badge";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";

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
    weeklySummaries,
    monthlySummary,
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
        <CardAction className="flex flex-col sm:flex-row justify-between items-center sm:gap-1 text-xs">
          <span className="font-medium">{t("monthly_stats")}:</span>{" "}
          <span className={getResultClass(monthlySummary.totalNetProfit)}>
            {formatDecimal(monthlySummary.totalNetProfit)} {coin}
          </span>
          <Badge variant="secondary">
            {monthlySummary.daysTraded} {t("total_days")}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="relative w-full overflow-auto">
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
                <DayProfitsCell key={index} {...item} coin={coin} />
              ))}
            </div>
            <div className="gap-1 hidden invisible md:grid md:visible">
              <div className="h-8" />
              {weeklySummaries.map((summary, index) => (
                <WeekSummaryCell key={index} {...summary} coin={coin} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
