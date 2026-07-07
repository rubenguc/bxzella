import { m } from '#/paraglide/messages'
import { useUserConfig } from '#/store/user-config'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatDecimal } from '#/lib/format-decimal'
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
        <ResponsiveContainer className="-mt-6" width="100%" height={100}>
          <PieChart>
            <Pie
              data={[
                { name: m['statistics.win'](), value: sumWin },
                { name: m['statistics.lost'](), value: sumLoss },
              ]}
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
            >
              <Cell strokeWidth={0} fill="var(--color-green-500)" />
              <Cell strokeWidth={0} fill="var(--color-red-500)" />
              <Tooltip
                formatter={(value: number) =>
                  formatDecimal(value, { suffix: coin })
                }
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      }
    />
  )
}
