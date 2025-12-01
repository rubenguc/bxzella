import { useTranslations } from "next-intl";
import { Profit } from "@/components/profit";
import type { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
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
      content={<Profit className="text-xl" amount={netPnL.value} coin={coin} />}
    />
  );
}
