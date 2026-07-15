import { formatAmount } from '#/lib/format-amount'
import { useUserConfig } from '@/store/user-config'

interface ProfitProps {
  netProfit: string | number
}

export function Profit({ netProfit }: ProfitProps) {
  const { coin } = useUserConfig()

  const value = Number(netProfit)

  return (
    <span
      className={`font-semibold ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}
    >
      {formatAmount(value, { precision: 4, suffix: coin })}
    </span>
  )
}
