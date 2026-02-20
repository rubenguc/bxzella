"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "motion/react";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { useEffect, useRef } from "react";
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
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";

const PAGE_SIZE = 10;

interface StatItemProps {
  text: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const StatItem = ({ text, value, icon, highlight = false }: StatItemProps) => (
  <div
    className={`group flex flex-col gap-1.5 rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50 ${highlight ? "ring-1 ring-accent" : ""}`}
  >
    <div className="flex items-center gap-1.5">
      {icon && (
        <span className="text-muted-foreground [&>svg]:size-3.5">{icon}</span>
      )}
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {text}
      </span>
    </div>
    <span
      className={`font-semibold ${highlight ? "text-lg text-foreground" : "text-base text-muted-foreground"}`}
    >
      {value}
    </span>
  </div>
);

export default function DailyJournal() {
  const t = useTranslations("daily-journal");
  const tCommon = useTranslationsCommon("common_messages");
  const { selectedAccount, isStoreLoaded, coin } = useUserConfigStore();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["day-profits", selectedAccount?._id, coin],
      queryFn: ({ pageParam = 0 }) =>
        getDayProfits({
          accountId: selectedAccount!._id,
          coin,
          limit: PAGE_SIZE,
          page: pageParam,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const hasMore = lastPage.data?.length === PAGE_SIZE;
        return hasMore ? allPages.length : undefined;
      },
      enabled: isStoreLoaded && !!selectedAccount?._id,
    });

  const dailyLogs = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const formatdDate = (date: string) => {
    const partes = date.split("-").map(Number);
    const fechaCorrecta = new Date(partes[0], partes[1] - 1, partes[2]);
    return format(fechaCorrecta, "EEEE, MMM dd, yyyy");
  };

  // Infinite scroll trigger
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5, rootMargin: "100px" },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {dailyLogs.map((log, index) => {
        const isProfitable = log.netPnL >= 0;

        return (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
          >
            <Card className="group overflow-hidden border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
              <div
                className={`h-1 w-full ${isProfitable ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-red-500 to-rose-400"}`}
              />
              <CardHeader>
                <CardTitle className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${isProfitable ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className="text-base font-medium text-muted-foreground">
                        {formatdDate(log.date)}
                      </span>
                    </div>
                    <Profit
                      amount={log.netPnL}
                      coin={coin}
                      prefix={t("net_pnl")}
                      className={`text-2xl font-bold ${isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    />
                  </div>
                  <CardAction>
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label={tCommon("aria_view_details")}
                      className="shrink-0"
                    >
                      {t("view_notes")}
                    </Button>
                  </CardAction>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <StatItem
                    text={t("total_trades")}
                    value={log.totalTrades}
                    highlight
                  />
                  <StatItem
                    text={t("winrate")}
                    value={`${formatDecimal(log.winRate, 2)}%`}
                    highlight
                  />
                  <StatItem text={t("winners")} value={log.winners} />
                  <StatItem text={t("losers")} value={log.lossers} />
                  <StatItem
                    text={t("profit_factor")}
                    value={formatDecimal(log.profitFactor, 2)}
                  />
                  <StatItem
                    text={t("commisions")}
                    value={formatDecimal(log.commissions, 4)}
                  />
                </div>
                <DayProfitsTradeList trades={log.trades as TradeDocument[]} />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="flex items-center justify-center py-8">
        {isFetchingNextPage && <Spinner className="size-6" />}
        {!hasNextPage && dailyLogs.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {t("no_more_entries")}
          </p>
        )}
      </div>
    </motion.div>
  );
}
