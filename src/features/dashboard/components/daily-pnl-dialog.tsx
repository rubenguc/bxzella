import { m } from "#/paraglide/messages";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "#/components/ui/dialog";
import type { CalendarCell } from "#/features/dashboard/types";
import { formatDecimal } from "#/lib/format-decimal";
import { DailyPnlTradeList } from "./daily-pnl-trade-list";

interface DailyPnlDialogProps {
  day: CalendarCell | null;
  onClose: () => void;
}

export function DailyPnlDialog({ day, onClose }: DailyPnlDialogProps) {
  if (!day || day.date === null) return null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = day.month !== undefined ? monthNames[day.month] : "";
  const formattedDate = `${monthName} ${day.date}`;
  const isPositive = (day.amount ?? 0) >= 0;

  return (
    <Dialog open={!!day} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" aria-describedby={undefined}>
        <DialogTitle className="flex items-center gap-3 text-base">
          <span>{formattedDate}</span>
          <span className="text-muted-foreground">|</span>
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {m['dashboard.day_profits.net_pnl']()}: {formatDecimal(day.amount ?? 0, { suffix: "USDT" })}
          </span>
        </DialogTitle>
        <div className="overflow-auto">
          <DailyPnlTradeList trades={day.allTrades ?? []} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
