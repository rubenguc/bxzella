import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";
import type { PlaybookTradeStatistics } from "../interfaces/playbooks-interfaces";
import { PlaybooksStatisticValue } from "./playbooks-statistic-card";

type PlaybooksOverviewProps = Omit<PlaybookTradeStatistics, "playbook">;

export function PlaybooksOverview({
  avgWinLoss,
  netPnL,
  profitFactor,
  tradeWin,
}: PlaybooksOverviewProps) {
  const t = useTranslations("playbook_details.overview");

  const { coin } = useUserConfigStore();

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 space-y-4">
          <PlaybooksStatisticValue
            title={t("net_pnl")}
            value={
              <span className={`text-lg ${getResultClass(netPnL.value || 0)}`}>
                {formatDecimal(netPnL.value || 0)} {coin}
              </span>
            }
          />
          <PlaybooksStatisticValue
            title={t("trades")}
            value={netPnL.totalTrades}
          />
          <PlaybooksStatisticValue
            title={t("win_rate")}
            value={formatDecimal(tradeWin.value)}
          />
          <PlaybooksStatisticValue
            title={t("profit_factor")}
            value={formatDecimal(profitFactor.value)}
          />
          <PlaybooksStatisticValue
            title={t("avg_winner")}
            value={formatDecimal(avgWinLoss.avgWin)}
          />
          <PlaybooksStatisticValue
            title={t("avg_loser")}
            value={formatDecimal(avgWinLoss.avgLoss)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
