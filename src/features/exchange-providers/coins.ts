import type { Coin } from './types'

/**
 * Returns the available coins for a given exchange provider.
 *
 * - `bingx` → USDT, VST
 * - `bitunix` → only USDT
 * - unknown / none → only USDT
 */
export function getCoinsForProvider(provider?: string): Coin[] {
  if (!provider) return ['USDT']
  if (provider === 'bingx') return ['USDT', 'VST']
  if (provider === 'bitunix') return ['USDT']
  return ['USDT']
}
