import clsx from 'clsx'
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
      className={clsx('font-semibold', {
        'text-green-500': value > 0,
        'text-red-500': value < 0,
      })}
    >
      {formatAmount(value, { precision: 4, suffix: coin })}
    </span>
  )
}
