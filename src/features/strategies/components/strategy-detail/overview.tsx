import { useQuery } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'

import { fetchStrategyStats } from '#/features/strategies/service'
import { NetPNL } from '#/features/dashboard/components/net-pnl'
import { ProfitFactor } from '#/features/dashboard/components/profit-factor'
import { TradeWinPercentage } from '#/features/dashboard/components/trade-win-percentage'
import { AvgWinLoss } from '#/features/dashboard/components/avg-win-loss'
import { CumulativePnlChart } from '#/features/dashboard/components/cumulative-pnl-chart'
import type { Coin } from '#/features/exchange-providers/types'

interface Props {
  strategyId: string
  accountId: string
  coin: Coin
}

export function StrategyOverview({ strategyId, accountId, coin }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['strategy-stats', strategyId, accountId, coin],
    queryFn: () => fetchStrategyStats(strategyId, accountId, coin),
  })

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
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

      <div className="min-h-[320px]">
        <CumulativePnlChart dayProfits={data.dayProfits} />
      </div>
    </div>
  )
}