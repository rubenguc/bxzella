"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AvgWinLoss } from "@/features/dashboard/components/avg-win-loss";
import { DayProfits } from "@/features/dashboard/components/day-profits";
import { DayProfitsChart } from "@/features/dashboard/components/day-profits-chart";
import { NetPNL } from "@/features/dashboard/components/net-pnl";
import { Positions } from "@/features/dashboard/components/positions";
import { ProfitFactor } from "@/features/dashboard/components/profit-factor";
import { StatisticsSkeleton } from "@/features/dashboard/components/statistics-skeleton";
import { TradeWinPercentage } from "@/features/dashboard/components/trade-win-percentage";
import DayProfitsProvider from "@/features/dashboard/context/day-profits-context";
import RecentTradesProvider, {
  useRecentTrades,
} from "@/features/dashboard/context/recent-trades-context";
import { getStatistics } from "@/features/dashboard/services/dashboard-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";

function SyncBar() {
  const t = useTranslations("dashboard");
  const { refetch, isLoading } = useRecentTrades();
  const { selectedAccount, coin } = useUserConfigStore();

  const lastSync = selectedAccount?.lastSyncPerCoin[coin]
    ? new Date(selectedAccount?.lastSyncPerCoin[coin]).toLocaleString()
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 mb-3 text-sm md:text-base"
    >
      <span className="text-muted-foreground">
        {t("last_sync_time")}: {lastSync}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => refetch()}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      </Button>
    </motion.div>
  );
}

export default function Dashboard() {
  const t = useTranslations("dashboard");

  const { selectedAccount, startDate, endDate, isStoreLoaded, coin } =
    useUserConfigStore();

  const { data, isLoading } = useQuery({
    queryKey: ["statistics", selectedAccount?._id, startDate, endDate, coin],
    queryFn: () =>
      getStatistics({
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        accountId: selectedAccount!._id,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        coin,
      }),
    enabled:
      isStoreLoaded && !!selectedAccount?._id && !!startDate && !!endDate,
  });

  if (isStoreLoaded && !selectedAccount?._id) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-center text-xl">
          {t("please_select_account_to_fetch_data")}
        </p>
      </motion.div>
    );
  }

  if (isLoading || !data) return <StatisticsSkeleton />;

  return (
    <RecentTradesProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <SyncBar />

        <motion.div
          className="grid gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, staggerChildren: 0.1 }}
          >
            <NetPNL netPnL={data?.netPnL || {}} />
            <ProfitFactor profitFactor={data?.profitFactor || {}} />
            <TradeWinPercentage tradeWin={data?.tradeWin || {}} />
            <AvgWinLoss avgWinLoss={data?.avgWinLoss || {}} />
          </motion.div>
          <motion.div
            className="grid grid-cols-1 xl:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Positions />
            <DayProfitsChart data={data?.dayProfits || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <DayProfitsProvider>
              <DayProfits />
            </DayProfitsProvider>
          </motion.div>
        </motion.div>
      </motion.div>
    </RecentTradesProvider>
  );
}
