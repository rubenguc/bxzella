"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Profit } from "@/components/profit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCoinPerformance } from "@/features/trades/services/trades-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";
import { formatDecimal } from "@/utils/number-utils";
import { transformSymbol } from "@/utils/trade-utils";

const Item = ({ text, value }: { text: string; value: string | number }) => (
  <div className="flex flex-col gap-0">
    <span className="text-muted-foreground text-xs font-medium tracking-tight">
      {text}
    </span>
    <span className="text-sm font-semibold tabular-nums">{value}</span>
  </div>
);

const PositionSideData = ({
  side,
  values,
}: {
  side: "LONG" | "SHORT";
  values: any;
}) => {
  const t = useTranslations("coin-performance");
  const isLong = side === "LONG";
  const Icon = isLong ? TrendingUp : TrendingDown;
  const accentClass = isLong
    ? "border-l-green-500 dark:border-l-green-600"
    : "border-l-red-500 dark:border-l-red-600";

  return (
    <div className={`flex-1 border-l-2 ${accentClass} pl-3`}>
      {/* Side header */}
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`size-4 ${isLong ? "text-green-500" : "text-red-500"}`}
        />
        <Badge
          variant={isLong ? "green-outline" : "red-outline"}
          className="font-semibold text-xs"
        >
          {side}
        </Badge>
        <Profit
          amount={values.netPnL || 0}
          className="ml-auto text-sm font-bold tabular-nums"
        />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        <Item text={t("total_trades")} value={values.totalTrades || 0} />
        <Item text={t("winners")} value={values.winners || 0} />
        <Item text={t("losers")} value={values.lossers || 0} />
        <Item
          text={t("winrate")}
          value={`${formatDecimal(values.winRate || 0, { precision: 2, showNumberSuffix: false })}%`}
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Object.keys(coins)
        .sort(
          (coinA, coinB) =>
            coins?.[coinB]?.GENERAL.netPnL - coins?.[coinA]?.GENERAL.netPnL,
        )
        .map((coin) => (
          <Card
            key={coin}
            className="border-muted/50 transition-shadow duration-200 hover:shadow-lg"
          >
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-md border bg-muted/50 px-3 py-1 text-base font-bold tracking-tight">
                  {transformSymbol(coin)}
                </span>
                <Profit
                  amount={coins[coin].GENERAL.netPnL}
                  coin={selectedCoin}
                  className="text-lg font-bold tabular-nums"
                />
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs font-medium"
                >
                  {coins[coin].GENERAL.totalTrades} trades
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-1 gap-4">
                <PositionSideData side="LONG" values={coins[coin].LONG} />
                <Separator
                  orientation="vertical"
                  className="h-auto self-stretch"
                />
                <PositionSideData side="SHORT" values={coins[coin].SHORT} />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
