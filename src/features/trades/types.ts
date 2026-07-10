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
