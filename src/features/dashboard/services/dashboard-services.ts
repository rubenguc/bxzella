import { Coin } from "@/interfaces/global-interfaces";
import { baseConfig } from "@/services/api";
import {
  TradeProfitPerDay,
  TradeStatisticsResult,
} from "@/features/trades/interfaces/trades-interfaces";

export const getStatistics = async (params: {
  accountId: string;
  startDate: string;
  endDate: string;
  coin: Coin;
}): Promise<TradeStatisticsResult> => {
  const response = await baseConfig.get("/statistics", { params });
  return response.data;
};

export const getDayProfits = async (params: {
  accountId: string;
  coin: Coin;
  month?: string;
}): Promise<TradeProfitPerDay[]> => {
  const response = await baseConfig.get("/statistics/day-profits", { params });
  return response.data;
};
