import { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";

export interface CalendarCell {
  date: number | null;
  amount: number | null;
  trades: number | null;
  allTrades?: TradeDocument[];
  month?: number;
  type?: "profit" | "loss";
}

export interface WeekSummary {
  weekNumber: number;
  totalNetProfit: number;
  totalTrades: number;
  daysTraded: number;
}
