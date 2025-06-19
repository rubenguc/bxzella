import { Coin } from "@/global-interfaces";
import { baseConfig } from "@/services/api";

export const getStatistics = async (params: {
  accountId: string;
  startDate: string;
  endDate: string;
  coin: Coin;
}) => {
  const response = await baseConfig.get("/statistics", { params });
  return response.data;
};

export const getTrades = async (params: {
  accountId: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  coin: Coin;
}) => {
  const response = await baseConfig.get("/trades", { params });
  return response.data;
};

export const getOpenPositions = async (params: { accountId: string }) => {
  const response = await baseConfig.get("/trades/open-positions", { params });
  return response.data;
};
