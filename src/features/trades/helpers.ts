/**
 * Finds the earliest openTime from a list of raw trades.
 * @returns ISO date string, or empty string if no trade has an openTime.
 */
export function resolveEarliestTradeDate(
  rawTrades: { openTime?: Date | null }[],
): string {
  const oldest = rawTrades.reduce((prev, curr) =>
    (curr.openTime ?? 0) < (prev.openTime ?? 0) ? curr : prev,
  )
  if (!oldest.openTime) return ''

  return new Date(oldest.openTime).toISOString()
}

/**
 * Transforms a raw symbol (e.g. "BTC-USDT" or "NCSK1000USDT") into a
 * human-readable short form ("BTC", "1000USDT").
 */
/**
 * Returns true if the position side indicates a long position.
 */
export function checkLongPosition(positionSide: string): boolean {
  return positionSide?.toLowerCase() === 'long'
}

export function transformSymbol(symbol: string): string {
  if (symbol.includes('2USD')) {
    return symbol
      .replace('NCSK', '')
      .replace('NCCO', '')
      .replace('2USD-USDT', '')
  }
  return symbol.split('-')?.[0] || ''
}
