import { m } from '#/paraglide/messages'
import { useUserConfig } from '#/store/user-config'
import { StatisticCard } from '#/features/dashboard/components/statistic-card'

interface NetPNLProps {
  value: number
  totalTrades: number
}

export function NetPNL({ value, totalTrades }: NetPNLProps) {
  const coin = useUserConfig((s) => s.coin)

  return (
    <StatisticCard
      title={m['statistics.net_pnl']()}
      popoverInfo={m['statistics.net_pnl_info']()}
      extraInfo={
        <span className="text-sm text-muted-foreground">
          {totalTrades} Trades
        </span>
      }
      content={
        <p className={`text-xl ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {value.toFixed(2)} {coin}
        </p>
      }
    />
  )
}
