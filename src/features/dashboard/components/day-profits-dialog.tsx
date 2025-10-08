import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDayProfitsContext } from "../context/day-profits-context";
import { useTranslations } from "next-intl";
import { getResultClass } from "@/utils/trade-utils";
import { useUserConfigStore } from "@/store/user-config-store";
import { DayProfitsTradeList } from "./day-profits-trade-list";
import { formatDecimal } from "@/utils/number-utils";

export function DayProfitsDialog() {
  const t = useTranslations("dashboard.day_profits");
  const { dayProfit, selectDayProfit } = useDayProfitsContext();
  const { coin } = useUserConfigStore();

  const isOpen = dayProfit !== null;

  const formattedDate = new Date(
    2025,
    (dayProfit?.month || 1) - 1,
    dayProfit?.date || 1,
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={() => selectDayProfit(null)}>
      <DialogContent className="max-w-3xl!">
        <DialogTitle className="flex items-center gap-3 text-base">
          <span>{formattedDate}</span>|
          <div
            className={`flex items-center gap-1 ${getResultClass(dayProfit?.amount || 0)}`}
          >
            <span> {`${t("net_pnl")} `}</span>
            <span>
              {formatDecimal(dayProfit?.amount || 0, 4)} {coin}
            </span>
          </div>
        </DialogTitle>
        <div className="overflow-auto">
          <DayProfitsTradeList trades={dayProfit?.allTrades || []} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
