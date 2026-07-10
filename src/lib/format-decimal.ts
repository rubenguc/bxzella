interface FormatDecimalOptions {
  precision?: number
  suffix?: string
}

export function formatDecimal(
  value: number | string,
  options: FormatDecimalOptions = {},
): string {
  const { precision = 2, suffix = '' } = options
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '0'
  const formatted = num.toFixed(precision).replace(/\.?0+$/, '')
  return suffix ? `${formatted} ${suffix}` : formatted
}
