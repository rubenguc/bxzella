"use client";

import { AvgWinLoss } from "@/features/dashboard/components/avg-win-loss";
import { DayProfits } from "@/features/dashboard/components/day-profits";
import { NetPNL } from "@/features/dashboard/components/net-pnl";
import { OpenPositions } from "@/features/dashboard/components/open-positions";
import { ProfitFactor } from "@/features/dashboard/components/profit-factor";
import { RecentTrades } from "@/features/dashboard/components/recent-trades";
import { StatisticsSkeleton } from "@/features/dashboard/components/statistics-skeleton";
import { TradeWinPercentage } from "@/features/dashboard/components/trade-win-percentage";
import DayProfitsProvider from "@/features/dashboard/context/day-profits-context";
import { getStatistics } from "@/features/dashboard/services/dashboard-services";
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

  const t = useTranslations("statistics");

  if (isStoreLoaded && !selectedAccountId) {
    return (
      <div>
        <p className="text-center text-xl">
          {t("please_select_account_to_fetch_data")}
        </p>
      </div>
    );
  }

  if (isLoading || !data) return <StatisticsSkeleton />;

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

      <div>
        <DayProfitsProvider>
          <DayProfits />
        </DayProfitsProvider>
      </div>
    </div>
  );
}
