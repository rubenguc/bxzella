import {
  PairStatistic,
  TradeStatisticsResult,
} from "@/features/trades/interfaces/trades-interfaces";
import { Coin } from "@/global-interfaces";

export interface AISummary {
  uid: string;
  statistics: TradeStatisticsResult;
  startDate: Date;
  endDate: Date;
  result: string;
  coin: Coin;
  model: string;
}

export interface AISummaryDocument extends AISummary {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AISummaryWeekSummary extends TradeStatisticsResult {
  pairs: PairStatistic[];
}
