import type { Coin } from "@/interfaces/global-interfaces";
import { baseConfig } from "@/services/api";
import type { KLineResponse } from "../bingx/bingx-interfaces";

export const getKLineData = async (params: {
  coin: Coin;
  symbol: string;
  startTime: string;
  accountId: string;
  interval: string;
}): Promise<KLineResponse["data"]> => {
  const response = await baseConfig.get("/trades/kline", {
    params,
  });

  return response.data;
};
