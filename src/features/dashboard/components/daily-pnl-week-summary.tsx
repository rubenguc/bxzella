import clsx from "clsx";
import { Badge } from "#/components/ui/badge";
import type { WeekSummary } from "#/features/dashboard/types";
import { formatAmount } from "#/lib/format-amount";
import { m } from "#/paraglide/messages";

interface DailyPnlWeekSummaryProps extends WeekSummary {}

export function DailyPnlWeekSummary({
  weekNumber,
  totalNetProfit,
  daysTraded,
}: DailyPnlWeekSummaryProps) {
  return (
    <div className="min-h-20 md:min-h-30 border rounded-lg flex flex-col justify-center py-1 px-2 bg-sidebar border-primary/50">
      <div className="text-[10px] sm:text-xs font-medium">
        {m['dashboard.day_profits.week']()} {weekNumber}
      </div>
      <div className={clsx('text-[10px] sm:text-xs font-bold', {
        'text-green-500': totalNetProfit > 0,
        'text-red-500': totalNetProfit < 0,
      })}>
        {formatAmount(totalNetProfit, { suffix: "USDT" })}
      </div>
      <Badge variant="secondary" className="mt-1">
        {daysTraded} {m['dashboard.day_profits.total_days']()}
      </Badge>
    </div>
  );
}
