import { makeRequest } from "./bingx-base";
import { UserBalanceResponse } from "./bingx-interfaces";

const PATHS = {
  USER_BALANCE: "/openApi/swap/v3/user/balance",
};

export const getUserBalance = async (
  apiKey: string,
  secretKey: string,
): Promise<UserBalanceResponse> => {
  return makeRequest({
    coin: "VST",
    apiKey,
    secretKey,
    path: PATHS.USER_BALANCE,
  });
};
