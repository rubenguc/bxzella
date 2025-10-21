import type { Trade } from "@/features/trades/interfaces/trades-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";
import type {
  GetPositionHistoryProps,
  ProviderInterface,
} from "../interfaces/providers-interfaces";
import { makeRequest } from "./bingx-base";
import type {
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

export class BingxProvider implements ProviderInterface {
  private apiKey: string;
  private secretKey: string;
  private BATCH_SIZE: number = 5;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  private async fetchFilledOrders({
    coin,
    startTs,
    endTs,
  }: GetPositionHistoryProps): Promise<UserFillOrdersResponse> {
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
    endTs,
    symbol,
  }: {
    coin: Coin;
    endTs: number;
    symbol: string;
  }): Promise<UserPositionHistoryResponse> {
    // 90 days ago
    const startTs = endTs - 90 * 24 * 60 * 60 * 1000;

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

  async areApiKeysValid(coin: Coin): Promise<boolean> {
    const accountBalanceResponse = (await makeRequest({
      coin,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.USER_BALANCE,
    })) as UserBalanceResponse;

    if (accountBalanceResponse.code === 100419) {
      /// TODO: ip code error
    }

    return accountBalanceResponse.code === 0;
  }

  async getPositionHistory({ startTs, endTs, coin }: GetPositionHistoryProps) {
    const filledOrders = await this.fetchFilledOrders({
      startTs,
      endTs,
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

            endTs,
            coin,
          })
            .then((r) =>
              r.data.positionHistory.map((ph) => ({
                ...ph,
                openTime: new Date(ph.openTime),
                updateTime: new Date(ph.updateTime),
                coin,
                type: "P",
              })),
            )
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

  async getActivePositions(coin: Coin): Promise<Trade[]> {
    const activePositons = (await makeRequest({
      coin,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.USER_ACTIVE_OPEN_POSITIONS,
    })) as UserPositionResponse;

    return activePositons.data;
  }
}
