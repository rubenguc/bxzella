import { WeekSummary } from "@/features/dashboard/interfaces/dashboard-interfaces";
import { formatDecimal } from "@/utils/number-utils";
import { Coin } from "@/global-interfaces";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface WeekSummaryCellProps extends WeekSummary {
  coin: Coin;
}

export function WeekSummaryCell({
  weekNumber,
  totalNetProfit,
  daysTraded,
  coin,
}: WeekSummaryCellProps) {
  const t = useTranslations("dashboard.day_profits");

  return (
    <div className="min-h-24 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col  justify-center py-1 px-2 ">
      <div className="text-[10px] sm:text-xs font-medium">
        {t("week")} {weekNumber}
      </div>
      <div
        className={`text-[10px] sm:text-xs font-bold ${totalNetProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
      >
        {formatDecimal(totalNetProfit)} {coin}
      </div>
      <Badge variant="secondary" className="mt-2">
        {daysTraded} {t("total_days")}
      </Badge>
    </div>
  );
}
