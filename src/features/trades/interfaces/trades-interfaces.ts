import type { Types } from "mongoose";
import type { Coin, PaginationResponse } from "@/interfaces/global-interfaces";
import type { PlaybookRulesCompletionResponse } from "./playbook-rules-completion-interface";

export type ContractType = "P" | "S"; // P = Perpetual | S = "Standard"

export type TradePlaybook = {
  id: string | null;
  rulesProgress: {
    groupName: string;
    rules: {
      name: string;
      isCompleted: boolean;
    }[];
  }[];
} | null;

export interface Trade {
  accountId: Types.ObjectId | string | null;
  positionId: string;
  symbol: string;
  positionSide: string;
  isolated: boolean;
  openTime: Date;
  updateTime: Date;
  avgPrice: string;
  avgClosePrice: string;
  realisedProfit: string;
  netProfit: string;
  positionAmt: string;
  closePositionAmt: string;
  leverage: number;
  closeAllPositions: boolean;
  positionCommission: string;
  totalFunding: string;
  type: "P" | "S";
  coin: Coin;
  playbook: TradePlaybook;
}

export type TradeDocument = Trade & {
  _id: string;
};

export interface TradeStatisticsResult {
  _id: null;
  profitFactor: {
    value: number;
    sumWin: number;
    sumLoss: number;
  };
  tradeWin: {
    value: number;
    totalWin: number;
    totalLoss: number;
  };
  avgWinLoss: {
    value: number;
    avgWin: number;
    avgLoss: number;
  };
  netPnL: {
    value: number;
    totalTrades: number;
  };
  dayProfits: {
    day: "string";
    profit: number;
  }[];
}

export interface PairStatistic {
  _id: number;
  symbol: string;
  totalNetProfit: number;
  totalNetProfitLong: number;
  totalNetProfitShort: number;
  avgOpenTime: number;
}

export interface TradeProfitPerDay {
  _id: string;
  netProfit: number;
  trades: TradeDocument[];
}

export interface OpenPosition
  extends Pick<Trade, "openTime" | "symbol" | "positionSide" | "leverage"> {}

// Queries

export interface BaseQuery {
  coin?: Coin;
  accountId: string;
}

export interface GetOpenPositionsProps {
  accountId: string;
  coin: Coin;
}

export interface FetchPositionHistoryForSymbolsProps {
  apiKey: string;
  secretKey: string;
  symbols: string[];
  timeRange: { startTs: number; endTs: number };
  uid: string;
  coin: Coin;
}

export interface GetTradesByAccountId extends BaseQuery {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}

export type GetTradesByAccountIdResponse = Promise<
  PaginationResponse<TradeDocument>
>;

export interface GetTradesStatisticProps {
  accountId: string;
  startDate: string;
  endDate: string;
  coin?: Coin;
}

export interface GetPaginatedTradesByPlaybook {
  accountId: string;
  startDate: string;
  endDate: string;
  coin?: Coin;
  playbookId: string;
  page?: number;
  limit?: number;
}

export type GetPaginatedTradesByPlaybookReponse = Promise<
  PaginationResponse<TradeDocument>
>;

export interface GetPlaybookRulesCompletionByPlaybookId {
  playbookId: string;
  accountId: string;
  startDate: string;
  endDate: string;
  coin?: Coin;
}

export type GetPlaybookRulesCompletionByPlaybookIdResponse =
  Promise<PlaybookRulesCompletionResponse>;

export interface GetTradeProfitByDays {
  accountId: string;
  startDate: string;
  endDate: string;
  coin?: Coin;
}

export interface GetCoinPerformanceProps {
  accountId: string;
  startDate: string;
  endDate: string;
  coin?: Coin;
}

export type GetCoinPerformanceResponse = Record<
  string,
  {
    LONG: Partial<TradeStatisticsResult>;
    SHORT: Partial<TradeStatisticsResult>;
  }
>;
