interface FormatAmountOptions {
  precision?: number
  suffix?: string
  compact?: boolean
}

export function formatAmount(
  value: number | string,
  options: FormatAmountOptions = {},
): string {
  const { precision = 2, suffix = '', compact = true } = options
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '0'

  let formatted: string

  if (compact && Math.abs(num) >= 1000) {
    const absNum = Math.abs(num)
    if (absNum >= 1_000_000) {
      formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, '')
      formatted += 'M'
    } else {
      formatted = (num / 1_000).toFixed(1).replace(/\.0$/, '')
      formatted += 'K'
    }
  } else {
    formatted = num.toFixed(precision).replace(/\.?0+$/, '')
  }

  return suffix ? `${formatted} ${suffix}` : formatted
}
