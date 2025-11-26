import { useTranslations } from "next-intl";
import type { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";
import { StatisticCard } from "./statistic-card";

interface NetPNLProps {
  netPnL: TradeStatisticsResult["netPnL"];
}

export function NetPNL({ netPnL }: NetPNLProps) {
  const coin = useUserConfigStore((state) => state.coin);
  const t = useTranslations("statistics");

  return (
    <StatisticCard
      title={t("net_pnl") as string}
      popoverInfo={t("net_pnl_info")}
      extraInfo={<span className="text-sm">{netPnL.totalTrades} Trades</span>}
      contentClassName="flex justify-between items-end"
      content={
        <p className={`text-xl ${getResultClass(netPnL.value || 0)}`}>
          {formatDecimal(netPnL.value || 0)} {coin}
        </p>
      }
    />
  );
}
