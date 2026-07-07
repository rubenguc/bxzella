import { m } from '#/paraglide/messages'
import { StatisticCard } from '#/features/dashboard/components/statistic-card'

interface TradeWinPercentageProps {
  value: number
  totalWin: number
  totalLoss: number
}

export function TradeWinPercentage({
  value,
  totalWin,
  totalLoss,
}: TradeWinPercentageProps) {
  return (
    <StatisticCard
      title={m['statistics.trade_win_percentage']()}
      popoverInfo={m['statistics.trade_win_percentage_info']()}
      content={<p className="text-xl">{value.toFixed(1)}%</p>}
      rightContent={
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-green-500">
            {m['statistics.win']()}: {totalWin}
          </span>
          <span className="text-red-500">
            {m['statistics.lost']()}: {totalLoss}
          </span>
        </div>
      }
    />
  )
}
