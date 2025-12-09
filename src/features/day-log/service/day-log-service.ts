import type { GetFullDayProfitsWithTradesResponse } from "@/features/day-log/interfaces/day-log-interfaces";

import type { Coin } from "@/interfaces/global-interfaces";
import { baseConfig } from "@/services/api";

export const getDayProfits = async (params: {
  accountId: string;
  coin: Coin;
  page: number;
  limit: number;
}): Promise<{ data: GetFullDayProfitsWithTradesResponse[] }> => {
  const response = await baseConfig.get("/daily-journal", { params });
  return response.data;
};
