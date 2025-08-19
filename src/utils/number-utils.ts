export function formatDecimal(value: number, precision = 2): string {
  const suffix = formatSuffix(value);

  const _value = value / (SUFFIXES[suffix] || 1);

  return _value.toFixed(precision) + suffix;
}

// create a function to determine if the abs number is bigger than 1k, 1m, etc, and return the appropriate suffix and the number
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
