import { m } from "#/paraglide/messages";
import type { WeekSummary } from "#/features/dashboard/types";
import { Badge } from "#/components/ui/badge";
import { formatDecimal } from "#/lib/format-decimal";

interface DailyPnlWeekSummaryProps extends WeekSummary {}

export function DailyPnlWeekSummary({
  weekNumber,
  totalNetProfit,
  daysTraded,
}: DailyPnlWeekSummaryProps) {
  const profitClass = totalNetProfit >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="min-h-20 md:min-h-30 border rounded-lg flex flex-col justify-center py-1 px-2 bg-sidebar border-primary/50">
      <div className="text-[10px] sm:text-xs font-medium">
        {m['dashboard.day_profits.week']()} {weekNumber}
      </div>
      <div className={`text-[10px] sm:text-xs font-bold ${profitClass}`}>
        {formatDecimal(totalNetProfit, { suffix: "USDT" })}
      </div>
      <Badge variant="secondary" className="mt-1">
        {daysTraded} {m['dashboard.day_profits.total_days']()}
      </Badge>
    </div>
  );
}
