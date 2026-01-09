import type { Types } from "mongoose";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import type { Coin, PaginationResponse } from "@/interfaces/global-interfaces";

export interface DayLog {
  accountId: Types.ObjectId | string | null;
  coin: Coin;
  date: string;
  netPnL: number;
  totalTrades: number;
  winRate: number;
  winners: number;
  lossers: number;
  commissions: number;
  profitFactor: number;
  trades: TradeDocument[] | string[];
}

export type DayLogDocument = DayLog & {
  _id: string;
};

// Define the interface for the query parameters
export interface GetDayLogsByAccountIdProps {
  accountId: string;
  startDate?: string;
  endDate?: string;
  coin?: Coin;
  page?: number;
  limit?: number;
}

export type GetDayLogsByAccountIdResponse = Promise<
  PaginationResponse<DayLogDocument>
>;

export interface GetDayLogByDayProps {
  accountId: string;
  date: string;
  coin?: Coin;
}

export interface GetDayProfitsWithTradesProps {
  accountId: string;
  startDate?: string;
  endDate?: string;
  coin?: Coin;
  page: number;
  limit: number;
}

export interface GetFullDayProfitsWithTradesResponse
  extends Omit<DayLogDocument, "trades"> {
  trades: Array<
    Pick<
      TradeDocument,
      | "_id"
      | "openTime"
      | "updateTime"
      | "symbol"
      | "positionSide"
      | "leverage"
      | "netProfit"
      | "positionId"
    >
  >;
}

export interface GetDayProfitsWithTradesResponse
  extends Pick<DayLogDocument, "_id" | "date" | "netPnL" | "totalTrades"> {
  trades: Array<
    Pick<
      TradeDocument,
      | "_id"
      | "openTime"
      | "updateTime"
      | "symbol"
      | "positionSide"
      | "leverage"
      | "netProfit"
      | "positionId"
    >
  >;
}
