export function formatDecimal(
  value: number,
  precision = 2,
  showSign: boolean = false,
): string {
  if (value === 0) {
    return "0";
  }

  const suffix = formatSuffix(value);
  const _value = value / (SUFFIXES[suffix] || 1);
  const _precision = suffix ? 2 : precision;

  let formattedValue = _value.toFixed(_precision);

  formattedValue = formattedValue.replace(/\.?0+$/, "");

  const sign = showSign && value > 0 ? "+" : "";

  return sign + formattedValue + suffix;
}

export function formatSuffix(value: number): string {
  if (Math.abs(value) >= 1e9) return "B";
  if (Math.abs(value) >= 1e6) return "M";
  if (Math.abs(value) >= 1e3) return "K";
  return "";
}

const SUFFIXES: Record<string, number> = {
  K: 1000,
  M: 1000000,
  B: 1000000000,
};
