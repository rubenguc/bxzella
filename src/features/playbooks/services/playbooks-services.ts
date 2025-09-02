import { Coin, PaginationResponse } from "@/global-interfaces";
import { baseConfig } from "@/services/api";
import {
  PlaybookDocument,
  PlaybookTradeStatistics,
} from "../interfaces/playbooks-interfaces";
import { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { PlaybookRulesCompletionResponse } from "@/features/trades/interfaces/playbook-rules-completion-interface";

export const getPlaybooks = async (params: {
  accountId: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  coin: Coin;
}): Promise<PaginationResponse<PlaybookTradeStatistics>> => {
  const response = await baseConfig.get("/playbooks", { params });
  return response.data;
};

export const getAllPlaybooks = async (params: {
  page: number;
  limit: number;
}): Promise<{
  data: PlaybookDocument[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  const response = await baseConfig.get("/playbooks/all", { params });
  return response.data;
};

export const getPlaybook = async (
  id: string,
  params: {
    accountId: string;
    startDate?: string;
    endDate?: string;
    coin: Coin;
  },
): Promise<PlaybookTradeStatistics> => {
  const response = await baseConfig.get(`/playbooks/${id}`, { params });
  return response.data.data;
};

export const getTradesByPlaybookId = async (
  id: string,
  params: {
    accountId: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
    coin: Coin;
  },
): Promise<PaginationResponse<TradeDocument>> => {
  const response = await baseConfig.get(`/playbooks/${id}/trades`, {
    params,
  });
  return response.data;
};

export const getRulesCompletionByPlaybookId = async (
  id: string,
  params: {
    accountId: string;
    startDate?: string;
    endDate?: string;
    coin: Coin;
  },
): Promise<PlaybookRulesCompletionResponse> => {
  const response = await baseConfig.get(`/playbooks/${id}/rules-completion`, {
    params,
  });
  return response.data;
};
