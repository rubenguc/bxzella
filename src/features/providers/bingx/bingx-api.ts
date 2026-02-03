import type {
  OpenPosition,
  Trade,
} from "@/features/trades/interfaces/trades-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";
import type {
  GetKLineData,
  GetPositionHistoryProps,
  ProviderInterface,
} from "../interfaces/providers-interfaces";
import { makeRequest } from "./bingx-base";
import type {
  KLineResponse,
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
  K_LINES: "/openApi/swap/v3/quote/klines",
};

export class BingxProvider implements ProviderInterface {
  private apiKey: string;
  private secretKey: string;
  private BATCH_SIZE: number = 5;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async areApiKeysValid(coin: Coin): Promise<boolean> {
    const accountBalanceResponse = (await makeRequest({
      coin,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.USER_BALANCE,
    })) as UserBalanceResponse;

    // if (isIncorrectApiKeyError) throw new Error("incorrect_api_key_error");

    // if (accountBalanceResponse.code === 100419) {
    //   /// TODO: ip code error
    // }

    return accountBalanceResponse.code === 0;
  }

  async getPositionHistory({
    coin,
    lastSyncTime,
  }: GetPositionHistoryProps): Promise<Trade[]> {
    const filledOrders = await this.fetchFilledOrders({
      lastSyncTime,
      coin,
    });
    const symbolsToFetch = this.processFilledOrders(filledOrders);

    if (symbolsToFetch.length === 0) return [];

    const batches = [];
    for (let i = 0; i < symbolsToFetch.length; i += this.BATCH_SIZE) {
      batches.push(symbolsToFetch.slice(i, i + this.BATCH_SIZE));
    }

    const allPositionHistories: Trade[] = [];
    for (const [index, batch] of batches.entries()) {
      const batchResults = await Promise.all(
        batch.map((symbol) =>
          this.fetchPositionHistory({
            symbol,
            coin,
            lastSyncTime,
          })
            .then((r) => {
              return (
                r.data.positionHistory?.map((ph) => ({
                  ...ph,
                  openTime: new Date(ph.openTime),
                  updateTime: new Date(ph.updateTime),
                  coin,
                  type: "P",
                })) || []
              );
            })
            .catch((error) => {
              console.error(
                `Error fetching position history for symbol ${symbol}:`,
                error,
              );
              return [];
            }),
        ),
      );

      allPositionHistories.push(...(batchResults.flat() as Trade[]));

      if (index < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return allPositionHistories;
  }

  async getOpenPositions(coin: Coin): Promise<OpenPosition[]> {
    const activePositons = (await makeRequest({
      coin,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.USER_ACTIVE_OPEN_POSITIONS,
    })) as UserPositionResponse;

    return activePositons.data.map((position) => ({
      symbol: position.symbol,
      openTime: new Date(position.createTime),
      leverage: position.leverage,
      positionSide: position.positionSide,
      realisedProfit: position.realisedProfit,
      unrealizedProfit: position.unrealizedProfit,
      coin: coin,
      margin: position.margin,
      pnlRatio: position.pnlRatio,
    }));
  }

  async getKLine({ coin, startTime, symbol, interval = "1h" }: GetKLineData) {
    const response = (await makeRequest({
      coin,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.K_LINES,
      payload: {
        symbol,
        interval,
        startTime,
        limit: 500,
      },
    })) as KLineResponse;

    return response.data;
  }

  // own methods to standardize
  private getTimeRangeForFetchFilledOrders(lastSyncTime: number) {
    let startTs = 0;
    const actualDate = Date.now();

    if (lastSyncTime) {
      startTs = lastSyncTime;
    } else {
      const dateLess30Days = new Date(actualDate);
      dateLess30Days.setDate(dateLess30Days.getDate() - 30);
      startTs = dateLess30Days.getTime();
    }
    const endTs = actualDate;

    return { startTs, endTs };
  }

  private getTimeRangeForFetchPositionsHistory(lastSyncTime: number) {
    let startTs = lastSyncTime;
    const endTs = Date.now();

    if (!lastSyncTime) startTs = endTs - 90 * 24 * 60 * 60 * 1000;

    return {
      startTs,
      endTs,
    };
  }

  private async fetchFilledOrders({
    coin,
    lastSyncTime,
  }: GetPositionHistoryProps): Promise<UserFillOrdersResponse> {
    const { startTs, endTs } =
      this.getTimeRangeForFetchFilledOrders(lastSyncTime);

    return makeRequest({
      coin,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.USER_FILLED_ORDERS,
      payload: {
        startTs,
        endTs,
      },
    });
  }

  private async fetchPositionHistory({
    coin,
    lastSyncTime,
    symbol,
  }: {
    coin: Coin;
    lastSyncTime: number;
    symbol: string;
  }): Promise<UserPositionHistoryResponse> {
    const { startTs, endTs } =
      this.getTimeRangeForFetchPositionsHistory(lastSyncTime);

    return makeRequest({
      coin,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.USER_POSITION_HISTORY,
      payload: {
        startTs,
        endTs,
        symbol,
      },
    });
  }

  private processFilledOrders(
    filledOrdersResult: UserFillOrdersResponse,
  ): string[] {
    if (
      !filledOrdersResult?.data?.fill_orders ||
      filledOrdersResult.data.fill_orders.length === 0
    ) {
      console.log("No filled orders found");
      return [];
    }

    const uniqueSymbols = [
      ...new Set(
        filledOrdersResult.data.fill_orders.map((order) => order.symbol),
      ),
    ];

    return uniqueSymbols;
  }
}
