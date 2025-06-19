import { baseConfig } from "@/services/api";

export const getAccounts = async (params: { page: number; limit: number }) => {
  const response = await baseConfig.get("/accounts", { params });
  return response.data;
};
