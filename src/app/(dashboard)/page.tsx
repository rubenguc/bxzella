"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AvgWinLoss } from "@/features/trades/components/AvgWinLoss";
import { NetPNL } from "@/features/trades/components/NetPNL";
import { OpenPositions } from "@/features/trades/components/OpenPositions";
import { ProfitFactor } from "@/features/trades/components/ProfitFactor";
import { RecentTrades } from "@/features/trades/components/RecentTrades";
import { TradeWinPercentage } from "@/features/trades/components/TradeWinPercentage";
import { getStatistics } from "@/services/api";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const { selectedAccountId, startDate, endDate, isStoreLoaded, coin } =
    useUserConfigStore();

  const { data, isLoading } = useQuery({
    queryKey: ["statistics", selectedAccountId, startDate, endDate, coin],
    queryFn: () =>
      getStatistics({
        accountId: selectedAccountId,
        startDate: transformDateToParam(startDate!),
        endDate: transformDateToParam(endDate!),
        coin,
      }),
    enabled: isStoreLoaded && !!selectedAccountId && !!startDate && !!endDate,
  });

  const t = useTranslations("dashboard.statistics");

  if (isStoreLoaded && !selectedAccountId) {
    return (
      <div>
        <p className="text-center text-xl">
          {t("please_select_account_to_fetch_data")}
        </p>
      </div>
    );
  }

  if (isLoading || !data)
    return (
      <div className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Skeleton className="col-span-1 h-26 max-h-40" />
          <Skeleton className="col-span-1 h-26 max-h-40" />
          <Skeleton className="col-span-1 h-26 max-h-40" />
          <Skeleton className="col-span-1 h-26 max-h-40" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Skeleton className="col-span-1 h-26 max-h-40" />
          <Skeleton className="col-span-1 h-26 max-h-40" />
        </div>
      </div>
    );

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <NetPNL netPnL={data?.netPnL || {}} />
        <ProfitFactor profitFactor={data?.profitFactor || {}} />
        <TradeWinPercentage tradeWin={data?.tradeWin || {}} />
        <AvgWinLoss avgWinLoss={data?.avgWinLoss || {}} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <OpenPositions />
        <RecentTrades />
      </div>
    </div>
  );
}
