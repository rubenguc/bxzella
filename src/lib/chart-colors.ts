/**
 * Shared colors for canvas-based chart renderers (lightweight-charts).
 *
 * Canvas renderers do not accept the theme's `oklch()` values, so these stay
 * as plain hex strings. Kept in one module so both charts share the same
 * palette.
 */
export const CHART_COLORS = {
  green: "#22c55e",
  red: "#ef4444",
  blue: "#2196F3",
  text: { light: "#6b7280", dark: "#9ca3af" },
  border: { light: "#e5e7eb", dark: "#1f2937" },
  foreground: { light: "#111827", dark: "#e5e7eb" },
} as const;

/**
 * Convert a `#rrggbb` color into an `rgba()` string with the given alpha
 * fraction. Used to derive translucent fills for canvas renderers from the
 * solid colors defined above.
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = /^#([0-9a-fA-F]{6})$/.exec(color);
  const value = hex ? Number.parseInt(hex[1], 16) : Number.NaN;
  if (Number.isNaN(value)) return color;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}