import type {
  Coin,
  GetKLineData,
  GetPositionHistoryProps,
  KLine,
  OpenPosition,
  Trade,
} from '#/features/exchange-providers/types'

export interface ProviderInterface {
  /** Validate that the stored API keys are still valid with the exchange. */
  areApiKeysValid(coin?: Coin): Promise<boolean>

  /** Get currently open positions. */
  getOpenPositions(coin: Coin): Promise<OpenPosition[]>

  /** Get historical closed positions / trades within a time range. */
  getPositionHistory(payload: GetPositionHistoryProps): Promise<Partial<Trade>[]>

  /** Fetch K-line (candlestick) data. */
  getKLine(payload: GetKLineData): Promise<KLine[]>
}
