import { Coin } from "@/global-interfaces";

export type ContractType = "P" | "S"; // P = Perpetual | S = "Standard"

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
