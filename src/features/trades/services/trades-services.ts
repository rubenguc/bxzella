import type { ActivePosition } from "@/features/providers/bingx/bingx-interfaces";
import type {
  GetOpenPositionsProps,
  GetTradesByAccountUID,
  TradeDocument,
} from "@/features/trades/interfaces/trades-interfaces";
import type {
  PaginationResponse,
  PaginationResponseWithSync,
} from "@/interfaces/global-interfaces";
import { baseConfig } from "@/services/api";

export const getTrades = async (
  params: GetTradesByAccountUID,
): Promise<PaginationResponseWithSync<TradeDocument>> => {
  const response = await baseConfig.get("/trades", { params });
  return response.data;
};

export const getOpenPositions = async (
  params: GetOpenPositionsProps,
): Promise<PaginationResponse<ActivePosition>> => {
  const response = await baseConfig.get("/trades/open-positions", { params });
  return response.data;
};
