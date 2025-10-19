import type { Types } from "mongoose";
import type { Coin } from "@/interfaces/global-interfaces";
import type { PaginationResponse } from "@/utils/db-utils";

export interface Playbook {
  accountId: Types.ObjectId | string | null;
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

export interface GetAllPlaybooksProps {
  accountId: string;
  page?: number;
  limit?: number;
}

export type GetAllPlaybooksPropsResponse = Promise<
  PaginationResponse<PlaybookDocument>
>;

export interface GetTradesStatisticByPlaybookProps {
  accountId: string;
  startDate: string;
  endDate: string;
  coin?: Coin;
  page?: number;
  limit?: number;
}

export type GetTradesStatisticByPlaybookResponse = Promise<
  PaginationResponse<PlaybookTradeStatistics>
>;

export interface GetTradesStatisticByPlaybookIdProps {
  playbookId: string;
  accountId: string;
  startDate: string;
  endDate: string;
  coin?: Coin;
}

export type GetTradesStatisticByPlaybookIdResponse = Promise<{
  data: PlaybookTradeStatistics;
}>;
