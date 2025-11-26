export type Coin = "VST" | "USDT" | "USDC";

export interface PaginationResponse<T> {
  data: T[];
  totalPages: number;
}

export interface PaginationResponseWithSync<T> extends PaginationResponse<T> {
  synced?: boolean;
}

export type Theme = "dark" | "light" | "system";

export type LeanDocument<T> = T extends {
  $locals?: never;
  __v?: any;
  _id?: any;
}
  ? T
  : "Please convert the document to a POJO via `.toObject()` or .lean()`";

export type Provider = "bingx" | "bitunix";

export type DayProfitsChartMode = "area" | "bar";
