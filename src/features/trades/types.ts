import type { Trade } from '#/features/trades/schema'

/** Trade returned to the client — same as the DB row for now. */
export type TradeItem = Trade

/** Generic paginated API response shape. */
export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
}

/** Paginated trades response with sync metadata. */
export interface PaginatedTradesResponse extends PaginatedResponse<TradeItem> {
  synced: boolean
  syncTime: number
  earliestTradeDate: string
}

/** Trade export item (includes notebook content). */
export interface TradeExportItem {
  positionId: string
  symbol: string
  positionSide: string
  isolated: boolean
  openTime: Date
  updateTime: Date
  avgPrice: string
  avgClosePrice: string | null
  realisedProfit: string
  netProfit: string
  positionAmt: string
  closePositionAmt: string | null
  leverage: number
  closeAllPositions: boolean
  positionCommission: string | null
  totalFunding: string | null
  type: string
  coin: string
  notebookContentPlainText: string | null
}
