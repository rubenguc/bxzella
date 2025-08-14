export interface Playbook {
  userId: string;
  name: string;
  description: string;
  icon: string;
  rulesGroup: PlaybookRulesGroup[];
  notes: string;
}

export interface PlaybookRulesGroup {
  name: string;
  rules: string[];
}

export type PlaybookDocument = Playbook & {
  _id: string;
};

export interface PlaybookTradeStatistics {
  playbook: Partial<PlaybookDocument>;
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
