import type { GetDayProfitsWithTradesResponse } from "@/features/day-log/interfaces/day-log-interfaces";
import type { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";
import { baseConfig } from "@/services/api";

export const getStatistics = async (params: {
  accountId: string;
  startDate: string;
  endDate: string;
  coin: Coin;
}): Promise<TradeStatisticsResult> => {
  const response = await baseConfig.get("/statistics", { params });
  return response.data;
};

export const getDayProfitsByMonth = async (params: {
  accountId: string;
  coin: Coin;
  month?: string;
}): Promise<GetDayProfitsWithTradesResponse[]> => {
  const response = await baseConfig.get("/statistics/day-profits", { params });
  return response.data;
};
