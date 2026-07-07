import { m } from '#/paraglide/messages'
import { useUserConfig } from '#/store/user-config'
import { StatisticCard } from '#/features/dashboard/components/statistic-card'

interface ProfitFactorProps {
  value: number
  sumWin: number
  sumLoss: number
}

export function ProfitFactor({ value, sumWin, sumLoss }: ProfitFactorProps) {
  const coin = useUserConfig((s) => s.coin)

  return (
    <StatisticCard
      title={m['statistics.profit_factor']()}
      popoverInfo={m['statistics.profit_factor_info']()}
      content={<p className="text-xl">{value.toFixed(2)}</p>}
      rightContent={
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-green-500">
            {m['statistics.win']()}: {sumWin.toFixed(2)} {coin}
          </span>
          <span className="text-red-500">
            {m['statistics.lost']()}: {sumLoss.toFixed(2)} {coin}
          </span>
        </div>
      }
    />
  )
}
