import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
import { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { StatisticCard } from "./StatisticCard";

interface AvgWinLossProps {
  avgWinLoss: TradeStatisticsResult["avgWinLoss"];
}

export function AvgWinLoss({ avgWinLoss }: AvgWinLossProps) {
  const t = useTranslations("statistics");
  const coin = useUserConfigStore((state) => state.coin);

  const total = avgWinLoss.avgWin + avgWinLoss.avgLoss;
  const avgWinPercentage = total > 0 ? (avgWinLoss.avgWin / total) * 100 : 0;
  const avgLossPercentage = total > 0 ? (avgWinLoss.avgLoss / total) * 100 : 0;

  return (
    <StatisticCard
      title={t("avg_win_loss") as string}
      popoverInfo={t("avg_win_loss_info")}
      contentClassName="flex justify-between items-end"
      content={
        <div className="flex justify-between items-end w-full">
          <p className="text-xl">{formatDecimal(avgWinLoss?.value || 0)}</p>
          <div className="flex flex-col gap-1 w-[70%]">
            <div
              id="bar"
              className="h-1.5 rounded-full"
              style={{
                background: `linear-gradient(to right, #22C55E ${avgWinPercentage}%, #EF4444 ${avgLossPercentage}%)`,
              }}
            />
            <div className="flex justify-between">
              <span className="text-green-500 text-xs">
                {formatDecimal(avgWinLoss.avgWin || 0)} {coin}
              </span>
              <span className="text-red-500 text-xs">
                {formatDecimal(avgWinLoss.avgLoss || 0)} {coin}
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
}
