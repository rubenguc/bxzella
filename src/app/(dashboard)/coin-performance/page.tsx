"use client";

import { Profit } from "@/components/profit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCoinPerformance } from "@/features/trades/services/trades-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";
import { formatDecimal } from "@/utils/number-utils";
import { transformSymbol } from "@/utils/trade-utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const Item = ({ text, value }: { text: string; value: string | number }) => (
  <div className="flex flex-col">
    <span className="text-muted-foreground text-sm">{text}</span>
    <span>{value}</span>
  </div>
);

const PositionSideData = ({ side, values }: { side: string; values: any }) => {
  const t = useTranslations("coin-performance");

  return (
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className="mb-0">{side}</span>
        <Profit amount={values.netPnL || 0} />
      </div>
      <div className="grid grid-cols-2 space-y-2">
        <Item text={t("total_trades")} value={values.totalTrades || 0} />
        <Item text={t("winners")} value={values.winners || 0} />
        <Item text={t("losers")} value={values.lossers || 0} />
        <Item
          text={t("winrate")}
          value={`${formatDecimal(values.winRate || 0, 2)}%`}
        />
      </div>
    </div>
  );
};

export default function CoinPerformance() {
  const {
    coin: selectedCoin,
    startDate,
    endDate,
    selectedAccount,
    isStoreLoaded,
  } = useUserConfigStore();

  const { data } = useQuery({
    queryKey: ["coinPerformance", selectedCoin, startDate, endDate],
    queryFn: () =>
      getCoinPerformance({
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        accountId: selectedAccount!._id,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        coin: selectedCoin,
      }),
    enabled:
      isStoreLoaded && !!selectedAccount?._id && !!startDate && !!endDate,
  });

  const coins = data || {};

  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.keys(coins)
        .sort(
          (coinA, coinB) =>
            coins[coinB]["GENERAL"]["netPnL"] -
            coins[coinA]["GENERAL"]["netPnL"],
        )
        .map((coin) => (
          <Card key={coin}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{transformSymbol(coin)}</span>
                <Profit
                  amount={coins[coin]["GENERAL"]["netPnL"]}
                  coin={selectedCoin}
                />
                <span className="text-muted-foreground font-light">
                  {coins[coin]["GENERAL"]["totalTrades"]} trades
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-1 space-x-3 justify-evenly px-1">
                <PositionSideData side={"LONG"} values={coins[coin]["LONG"]} />
                <Separator orientation="vertical" className="h-28!" />
                <PositionSideData
                  side={"SHORT"}
                  values={coins[coin]["SHORT"]}
                />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
