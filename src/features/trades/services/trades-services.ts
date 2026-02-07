import type {
  GetCoinPerformanceProps,
  GetCoinPerformanceResponse,
  GetOpenPositionsProps,
  GetTradesByAccountId,
  OpenPosition,
  TradeDocument,
} from "@/features/trades/interfaces/trades-interfaces";
import type {
  PaginationResponse,
  PaginationResponseWithSync,
} from "@/interfaces/global-interfaces";
import { baseConfig } from "@/services/api";

export const getTrades = async (
  params: GetTradesByAccountId,
): Promise<PaginationResponseWithSync<TradeDocument>> => {
  const response = await baseConfig.get("/trades", { params });
  return response.data;
};

export const getOpenPositions = async (
  params: GetOpenPositionsProps,
): Promise<PaginationResponse<OpenPosition>> => {
  const response = await baseConfig.get("/trades/open-positions", { params });
  return response.data;
};

export const getCoinPerformance = async (
  params: GetCoinPerformanceProps,
): Promise<GetCoinPerformanceResponse> => {
  const response = await baseConfig.get("/reports/coin-performance", {
    params,
  });
  return response.data;
};

export const getTradeByAccountId = async (
  positionId: string,
  { accountId }: { accountId: string },
): Promise<TradeDocument | null> => {
  const response = await baseConfig.get(`/trades/details/${positionId}`, {
    params: { accountId },
  });
  return response.data;
};

export const getPlaybookTradeProgress = async (tradeId: string) => {
  const response = await baseConfig.get(`/trades/playbook-progress/${tradeId}`);
  return response.data;
};
