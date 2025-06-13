"use client";

import { AvgWinLoss } from "@/features/trades/components/AvgWinLoss";
import { NetPNL } from "@/features/trades/components/NetPNL";
import { OpenPositions } from "@/features/trades/components/OpenPositions";
import { ProfitFactor } from "@/features/trades/components/ProfitFactor";
import { RecentTrades } from "@/features/trades/components/RecentTrades";
import { TradeWinPercentage } from "@/features/trades/components/TradeWinPercentage";
import { useUserConfigStore } from "@/store/user-config-store";
import { useQuery } from "@tanstack/react-query";

async function fetchStatistics(
  uid: string,
  startDate: number,
  endDate: number,
) {
  const res = await fetch(
    `/api/statistics?account_id=${uid}&startDate=${startDate}&endDate=${endDate}`,
  );
  return res.json();
}

export default function Dashboard() {
  const { selectedAccountId, startDate, endDate } = useUserConfigStore();

  const { data, isLoading } = useQuery({
    queryKey: ["statistics", selectedAccountId, startDate, endDate],
    queryFn: () => fetchStatistics(selectedAccountId, startDate, endDate),
    enabled: !!selectedAccountId && startDate !== 0 && endDate !== 0,
  });

  if (isLoading) return;

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <NetPNL netPnL={data?.netPnL || 0} />
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
