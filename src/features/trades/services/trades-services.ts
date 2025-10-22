import type {
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
