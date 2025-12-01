import { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";

export type LimitedTrade = Pick<
  TradeDocument,
  | "_id"
  | "openTime"
  | "updateTime"
  | "symbol"
  | "positionSide"
  | "leverage"
  | "netProfit"
  | "coin"
>;

export interface CalendarCell {
  date: number | null;
  amount: number | null;
  trades: number | null;
  allTrades?: LimitedTrade[];
  month?: number;
  type?: "profit" | "loss";
}

export interface WeekSummary {
  weekNumber: number;
  totalNetProfit: number;
  totalTrades: number;
  daysTraded: number;
}
