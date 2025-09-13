export type Coin = "VST" | "USDT";

export interface PaginationResponse<T> {
  data: T[];
  totalPages: number;
}

export interface PaginationResponseWithSync<T> extends PaginationResponse<T> {
  synced?: boolean;
}

export type Theme = "dark" | "light" | "system";
