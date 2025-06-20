import { Card, CardContent } from "@/components/ui/card";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
import { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";

interface NetPNLProps {
  netPnL: TradeStatisticsResult["netPnL"];
}

export function NetPNL({ netPnL }: NetPNLProps) {
  const coin = useUserConfigStore((state) => state.coin);
  const t = useTranslations("dashboard.statistics");

  const isProfit = netPnL.value > 0;

  return (
    <Card className="max-h-26">
      <CardContent>
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            {t("net_pnl")} |{" "}
            <span className="text-sm">{netPnL.totalTrades} Trades</span>
          </p>
          <p className={`text-xl ${isProfit ? "text-green-500" : "text-500"}`}>
            {formatDecimal(netPnL.value || 0)} {coin}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
