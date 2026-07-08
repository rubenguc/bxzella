/**
 * Converts a local date string to a UTC timestamp, adjusted by the user's
 * timezone offset.
 *
 * @param date - Local date string in `yyyy-MM-dd` format.
 * @param timezone - Timezone offset in hours (e.g. -3 for UTC-3, 5 for UTC+5).
 * @param isEndOfDay - When `true`, returns the end of that day (23:59:59) in
 *   UTC. When `false`, returns the start of that day (00:00:00) in UTC.
 * @returns ISO-like timestamp string suitable for PostgreSQL.
 *
 * @example
 * ```ts
 * adjustDateToUTC('2024-01-15', -3, false)
 * // "2024-01-15 03:00:00"
 *
 * adjustDateToUTC('2024-01-15', -3, true)
 * // "2024-01-16 02:59:59"
 *
 * adjustDateToUTC('2024-01-15', 5, false)
 * // "2024-01-14 19:00:00"
 * ```
 */
export function adjustDateToUTC(
  date: string,
  timezone: number,
  isEndOfDay: boolean,
): string {
  // Start of the local day in UTC: local_midnight - timezone_offset
  // For UTC-3 (offset = -3): 2024-01-15 00:00 - (-3h) = 2024-01-15 03:00 UTC
  // For UTC+5 (offset = 5):  2024-01-15 00:00 - 5h = 2024-01-14 19:00 UTC
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCHours(d.getUTCHours() - timezone)

  if (isEndOfDay) {
    // Move to end of the local day: add 24h - 1s
    d.setUTCHours(d.getUTCHours() + 24)
    d.setUTCSeconds(d.getUTCSeconds() - 1)
  }

  return d.toISOString().replace('T', ' ').replace('Z', '')
}
