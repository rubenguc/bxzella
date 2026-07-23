/**
 * Supported exchange providers (lowercase — matches DB enum).
 * For display labels, use PROVIDER_INFO[label].
 */
export const PROVIDERS = ['bingx', 'bitunix'] as const

export type Provider = (typeof PROVIDERS)[number]

export type ProviderValue = Provider

export interface ProviderInfo {
  label: string
  value: ProviderValue
  image: string
}

export const PROVIDER_INFO: Record<ProviderValue, ProviderInfo> = {
  bingx: {
    label: 'Bingx',
    value: 'bingx',
    image: '/assets/providers/bingx.jpeg',
  },
  bitunix: {
    label: 'Bitunix',
    value: 'bitunix',
    image: '/assets/providers/bitunix.webp',
  },
} as const

export const PROVIDER_LIST: ProviderInfo[] = Object.values(PROVIDER_INFO)

// ── Shared domain types ───────────────────────────────

export type Coin = 'VST' | 'USDT' | 'USDC'

export const COINS: Coin[] = ['VST', 'USDT', 'USDC']

export const COIN_LABELS: Record<Coin, string> = {
  VST: 'VST',
  USDT: 'USDT',
  USDC: 'USDC',
}

export type ContractType = 'P' | 'S'

export interface OpenPosition {
  symbol: string
  openTime: Date
  leverage: number
  positionSide: string
  realisedProfit: string
  unrealizedProfit: string
  coin: Coin
  pnlRatio: string
  margin: string
}

export interface Trade {
  accountId: string | null
  positionId: string
  symbol: string
  positionSide: string
  isolated: boolean
  openTime: Date
  updateTime: Date
  avgPrice: string
  avgClosePrice: string
  realisedProfit: string
  netProfit: string
  positionAmt: string
  closePositionAmt: string
  leverage: number
  closeAllPositions: boolean
  positionCommission: string
  totalFunding: string
  type: ContractType
  coin: Coin
}

export interface KLine {
  open: string
  close: string
  high: string
  low: string
  volume: string
  time: number
}

export interface GetPositionHistoryProps {
  coin: Coin
  lastSyncTime: number
}

export interface GetKLineData {
  coin: Coin
  symbol: string
  startTime: number
  endTime: number
  interval?: string
}
