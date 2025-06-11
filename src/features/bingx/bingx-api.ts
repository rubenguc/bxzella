import { makeRequest } from "./bingx-base";
import {
  UserBalanceResponse,
  UserFillOrdersResponse,
  UserPositionHistoryResponse,
  UserPositionResponse,
} from "./bingx-interfaces";

const PATHS = {
  USER_BALANCE: "/openApi/swap/v3/user/balance",
  USER_ACTIVE_OPEN_POSITIONS: "/openApi/swap/v2/user/positions",
  USER_FILLED_ORDERS: "/openApi/swap/v2/trade/allFillOrders",
  USER_POSITION_HISTORY: "/openApi/swap/v1/trade/positionHistory",
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

export const getUserActiveOpenPositions = async (
  apiKey: string,
  secretKey: string,
): Promise<UserPositionResponse> => {
  return makeRequest({
    coin: "VST",
    apiKey,
    secretKey,
    path: PATHS.USER_ACTIVE_OPEN_POSITIONS,
  });
};

export const getFilledOrders = async (
  apiKey: string,
  secretKey: string,
  payload: {
    startTs: number;
    endTs: number;
  },
): Promise<UserFillOrdersResponse> => {
  return makeRequest({
    coin: "VST",
    apiKey,
    secretKey,
    path: PATHS.USER_FILLED_ORDERS,
    payload,
  });
};

export const getPositionHistory = async (
  apiKey: string,
  secretKey: string,
  payload: {
    symbol: string;
    startTs: number;
    endTs: number;
  },
): Promise<UserPositionHistoryResponse> => {
  return makeRequest({
    coin: "VST",
    apiKey,
    secretKey,
    path: PATHS.USER_POSITION_HISTORY,
    payload,
  });
};
