"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { Profit } from "@/components/profit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { DayProfitsTradeList } from "@/features/dashboard/components/day-profits-trade-list";
import { getDayProfits } from "@/features/day-log/service/day-log-service";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { usePagination } from "@/hooks/use-pagination";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";

const Item = ({ text, value }: { text: string; value: string | number }) => (
  <div className="flex flex-col">
    <span className="text-muted-foreground text-sm">{text}</span>
    <span>{value}</span>
  </div>
);

export default function DailyJournal() {
  const t = useTranslations("daily-journal");
  const tCommon = useTranslationsCommon("common_messages");
  const { selectedAccount, isStoreLoaded, coin } = useUserConfigStore();

  const { limit, page } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: ["day-profits", selectedAccount?._id, coin, limit, page],
    queryFn: () =>
      getDayProfits({
        accountId: selectedAccount!._id,
        coin,
        limit,
        page,
      }),
    enabled: isStoreLoaded && !!selectedAccount?._id,
  });

  const dailyLogs = data?.data ?? [];

  const formatdDate = (date: string) => {
    const partes = date.split("-").map(Number);
    const fechaCorrecta = new Date(partes[0], partes[1] - 1, partes[2]);
    return format(fechaCorrecta, "E, MMM dd, yyyy");
  };

  if (isLoading) return <Spinner className="mx-auto size-6" />;

  return (
    <div className="flex flex-col space-y-5">
      {dailyLogs.map((log) => (
        <Card key={log._id}>
          <CardHeader>
            <CardTitle className="flex flex-col md:flex-row  md:items-center space-x-5 space-y-2">
              <span>{formatdDate(log.date)}</span>
              <Profit amount={log.netPnL} coin={coin} preffix={t("net_pnl")} />
            </CardTitle>
            <CardAction>
              <Button size="sm" aria-label={tCommon("aria_view_details")}>
                {t("view_notes")}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 space-y-4 mb-2">
              <div className="grid space-y-4">
                <Item text={t("profit_factor")} value={log.totalTrades} />
                <Item
                  text={t("winrate")}
                  value={`${formatDecimal(log.winRate, 2)}%`}
                />
              </div>
              <div className="grid space-y-4">
                <Item text={t("winners")} value={log.winners} />
                <Item text={t("losers")} value={log.lossers} />
              </div>
              <div className="grid space-y-4">
                <Item
                  text={t("profit_factor")}
                  value={formatDecimal(log.profitFactor, 2)}
                />
                <Item
                  text={t("commisions")}
                  value={formatDecimal(log.commissions, 6)}
                />
              </div>
            </div>
            <DayProfitsTradeList trades={log.trades as TradeDocument[]} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
