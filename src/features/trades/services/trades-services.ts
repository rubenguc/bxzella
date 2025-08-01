import { Coin, PaginationResponse } from "@/global-interfaces";
import { baseConfig } from "@/services/api";
import { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { ActivePosition } from "@/features/bingx/bingx-interfaces";

export const getTrades = async (params: {
  accountId: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  coin: Coin;
}): Promise<PaginationResponse<TradeDocument>> => {
  const response = await baseConfig.get("/trades", { params });
  return response.data;
};

export const getOpenPositions = async (params: {
  accountId: string;
}): Promise<PaginationResponse<ActivePosition>> => {
  const response = await baseConfig.get("/trades/open-positions", { params });
  return response.data;
};
