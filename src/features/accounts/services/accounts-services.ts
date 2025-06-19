import { baseConfig } from "@/services/api";
import { AccountDocument } from "@/features/accounts/interfaces/accounts-interfaces";
import { PaginationResponse } from "@/global-interfaces";

export const getAccounts = async (params: {
  page: number;
  limit: number;
}): Promise<PaginationResponse<AccountDocument>> => {
  const response = await baseConfig.get("/accounts", { params });
  return response.data;
};
