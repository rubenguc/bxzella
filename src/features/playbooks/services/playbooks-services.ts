import { Coin, PaginationResponse } from "@/global-interfaces";
import { baseConfig } from "@/services/api";
import {
  PlaybookDocument,
  PlaybookTradeStatistics,
} from "../interfaces/playbooks-interfaces";

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
