import { Card, CardContent } from "@/components/ui/card";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";

interface AvgWinLossProps {
  avgWinLoss: { value: number; avgWin: number; avgLoss: number };
}

export function AvgWinLoss({ avgWinLoss }: AvgWinLossProps) {
  const t = useTranslations("dashboard.statistics");
  const coin = useUserConfigStore((state) => state.coin);

  const total = avgWinLoss.avgWin + avgWinLoss.avgLoss;
  const avgWinPercentage = total > 0 ? (avgWinLoss.avgWin / total) * 100 : 50;
  const avgLossPercentage = total > 0 ? (avgWinLoss.avgLoss / total) * 100 : 50;

  return (
    <Card className="max-h-26">
      <CardContent>
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-300 text-sm">{t("avg_win_loss")}</p>
          <div className="flex justify-between items-end">
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
                  {formatDecimal(avgWinLoss.avgWin)} {coin}
                </span>
                <span className="text-red-500 text-xs">
                  {formatDecimal(avgWinLoss.avgLoss)} {coin}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
