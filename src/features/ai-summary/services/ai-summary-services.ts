import { baseConfig } from "@/services/api";

export const getAISummary = async (params: {
  accountId: string;
  coin: string;
  page: number;
  limit: number;
}) => {
  const response = await baseConfig.get("/ai-summary", { params });
  return response.data;
};

export const getLastAISummary = async (params: {
  accountId: string;
  coin: string;
}) => {
  const response = await baseConfig.get("/ai-summary/last", { params });
  return response.data;
};
