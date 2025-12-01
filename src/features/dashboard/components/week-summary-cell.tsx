import { useTranslations } from "next-intl";
import { Profit } from "@/components/profit";
import { Badge } from "@/components/ui/badge";
import type { WeekSummary } from "@/features/dashboard/interfaces/dashboard-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";

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
    <div className="min-h-24 border  rounded-lg flex flex-col  justify-center py-1 px-2 bg-sidebar border-primary/50">
      <div className="text-[10px] sm:text-xs font-medium">
        {t("week")} {weekNumber}
      </div>
      <Profit
        className={`text-[10px] sm:text-xs font-bold`}
        amount={totalNetProfit}
        coin={coin}
      />
      <Badge variant="secondary" className="mt-1">
        {daysTraded} {t("total_days")}
      </Badge>
    </div>
  );
}
