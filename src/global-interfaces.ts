export type Coin = "VST" | "USDT";

export interface PaginationResponse<T> {
  data: T[];
  totalPages: number;
}

export type Theme = "dark" | "light" | "system";
