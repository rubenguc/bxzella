import type { Coin, PaginationResponse } from "@/interfaces/global-interfaces";

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
  accountUID: string;
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

// Queries

export interface BaseQuery {
  coin?: Coin;
  accountUID: string;
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

export interface GetTradesByAccountUID extends BaseQuery {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
}

export type GetTradesByAccountUIDResponse = Promise<
  PaginationResponse<TradeDocument>
>;

export interface GetTradesStatisticProps {
  accountUID: string;
  startDate: Date;
  endDate: Date;
  coin?: Coin;
}

export interface GetPaginatedTradesByPlaybook {
  accountUID: string;
  startDate: Date;
  endDate: Date;
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
  accountUID: string;
  startDate: Date;
  endDate: Date;
  coin?: Coin;
}
