import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { m } from "#/paraglide/messages";
import { useUserConfig } from "#/store/user-config";
import { SyncButton } from "#/features/trades/components/sync-button";
import { getDashboardStats } from "#/features/dashboard/service";
import { NetPNL } from "#/features/dashboard/components/net-pnl";
import { ProfitFactor } from "#/features/dashboard/components/profit-factor";
import { TradeWinPercentage } from "#/features/dashboard/components/trade-win-percentage";
import { AvgWinLoss } from "#/features/dashboard/components/avg-win-loss";
import { LoaderCircle } from "lucide-react";
import { Positions } from "#/features/dashboard/components/positions";
import { CumulativePnlChart } from "#/features/dashboard/components/cumulative-pnl-chart";
import { DailyPnlCalendar } from "#/features/dashboard/components/daily-pnl-calendar";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { selectedAccount, startDate, endDate, coin } = useUserConfig();

  const { data, isLoading } = useQuery({
    queryKey: [
      "dashboard-stats",
      selectedAccount?.id,
      startDate?.toISOString(),
      endDate?.toISOString(),
      coin,
    ],
    queryFn: () =>
      getDashboardStats({
        accountId: selectedAccount!.id,
        startDate: format(startDate!, "yyyy-MM-dd"),
        endDate: format(endDate!, "yyyy-MM-dd"),
        coin,
      }),
    enabled: !!selectedAccount && !!startDate && !!endDate,
  });

  if (!selectedAccount) {
    return (
      <p className="text-center text-xl text-muted-foreground">
        {m["accounts.select_account"]()}
      </p>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SyncButton accountId={selectedAccount.id} coin={coin} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <NetPNL
          value={data.netPnL.value}
          totalTrades={data.netPnL.totalTrades}
        />
        <ProfitFactor
          value={data.profitFactor.value}
          sumWin={data.profitFactor.sumWin}
          sumLoss={data.profitFactor.sumLoss}
        />

        <TradeWinPercentage
          value={data.tradeWin.value}
          totalWin={data.tradeWin.totalWin}
          totalLoss={data.tradeWin.totalLoss}
        />
        <AvgWinLoss
          value={data.avgWinLoss.value}
          avgWin={data.avgWinLoss.avgWin}
          avgLoss={data.avgWinLoss.avgLoss}
        />
      </div>
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 min-w-0 h-100">
          <Positions />
        </div>
        <div className="flex-1 min-w-0 h-100">
          <CumulativePnlChart dayProfits={data.dayProfits} />
        </div>
      </div>

      <DailyPnlCalendar />
    </div>
  );
}
