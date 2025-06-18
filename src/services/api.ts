import { Coin } from "@/global-interfaces";
import axios from "axios";

export const baseConfig = axios.create({
  baseURL: "/api",
});

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

export const getAccounts = async (params: { page: number; limit: number }) => {
  const response = await baseConfig.get("/accounts", { params });
  return response.data;
};

export const getOpenPositions = async (params: { accountId: string }) => {
  const response = await baseConfig.get("/trades/open-positions", { params });
  return response.data;
};
