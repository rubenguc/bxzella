export type Coin = "VST" | "USDT";

export interface PaginationResponse<T> {
  data: T[];
  totalPages: number;
}
