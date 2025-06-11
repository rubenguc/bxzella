export function formatDecimal(value: number, precision = 2): string {
  return value.toFixed(precision);
}
