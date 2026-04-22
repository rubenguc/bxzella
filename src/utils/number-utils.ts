interface FormatDecimalOptions {
  precision?: number;
  showSign?: boolean;
  showNumberSuffix?: boolean;
  suffix?: string;
}

export function formatDecimal(
  value: number | string,
  options: FormatDecimalOptions = {},
): string {
  const {
    precision = 2,
    showSign = false,
    showNumberSuffix = true,
    suffix = "",
  } = options;

  const _value = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isNaN(_value) || _value === 0) {
    return "0";
  }

  const numberSuffix = showNumberSuffix ? formatSuffix(_value) : "";
  const dividedValue = _value / (SUFFIXES[numberSuffix] || 1);
  const _precision = numberSuffix ? 2 : precision;

  let formattedValue = dividedValue.toFixed(_precision);

  formattedValue = formattedValue.replace(/\.?0+$/, "");

  const sign = showSign && _value > 0 ? "+" : "";

  return (
    sign + formattedValue + numberSuffix + (suffix ? ` ${suffix}` : suffix)
  );
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
