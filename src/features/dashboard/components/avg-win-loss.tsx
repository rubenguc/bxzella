import { m } from '#/paraglide/messages'
import { useUserConfig } from '#/store/user-config'
import { StatisticCard } from '#/features/dashboard/components/statistic-card'

interface AvgWinLossProps {
  value: number
  avgWin: number
  avgLoss: number
}

export function AvgWinLoss({ value, avgWin, avgLoss }: AvgWinLossProps) {
  const coin = useUserConfig((s) => s.coin)

  const total = avgWin + avgLoss
  const avgWinPercentage = total > 0 ? (avgWin / total) * 100 : 0
  const avgLossPercentage = total > 0 ? (avgLoss / total) * 100 : 0

  return (
    <StatisticCard
      title={m['statistics.avg_win_loss']()}
      popoverInfo={m['statistics.avg_win_loss_info']()}
      content={
        <div className="flex justify-between items-end w-full">
          <p className="text-xl">{value.toFixed(1)}%</p>
          <div className="flex flex-col gap-1 w-[70%]">
            <div
              className="h-1.5 rounded-full"
              style={{
                background: `linear-gradient(to right, #22C55E ${avgWinPercentage}%, #EF4444 ${avgLossPercentage}%)`,
              }}
            />
            <div className="flex justify-between">
              <span className="text-green-500 text-xs">
                {avgWin.toFixed(2)} {coin}
              </span>
              <span className="text-red-500 text-xs">
                {avgLoss.toFixed(2)} {coin}
              </span>
            </div>
          </div>
        </div>
      }
    />
  )
}
