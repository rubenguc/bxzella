import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { m } from '#/paraglide/messages'
import { Badge } from '#/components/ui/badge'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { cx, outerRadius, value: labelValue, index } = props

    const RADIAN = Math.PI / 180
    const angleRad = index === 0 ? 180 * RADIAN : 0 * RADIAN
    const edgeX = cx + outerRadius * 0.9 * Math.cos(angleRad)

    return (
      <foreignObject x={edgeX - 30} y={50} width={60} height={24}>
        <div className="flex justify-center items-center h-full">
          <Badge
            className={`px-1.5 py-[1px] rounded-full whitespace-nowrap ${
              index === 0
                ? 'text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900'
                : 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900'
            }`}
          >
            {labelValue}
          </Badge>
        </div>
      </foreignObject>
    )
  }

  return (
    <StatisticCard
      title={m['statistics.trade_win_percentage']()}
      popoverInfo={m['statistics.trade_win_percentage_info']()}
      content={<p className="text-xl">{value.toFixed(1)}%</p>}
      rightContent={
        <ResponsiveContainer className="-mt-3" width="100%" height={80}>
          <PieChart>
            <Pie
              data={[
                { name: 'wins', value: totalWin },
                { name: 'losses', value: totalLoss },
              ]}
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              <Cell strokeWidth={0} fill="var(--color-green-500)" />
              <Cell strokeWidth={0} fill="var(--color-red-500)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      }
    />
  )
}
