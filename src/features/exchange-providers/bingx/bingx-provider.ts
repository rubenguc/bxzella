import crypto from "node:crypto";
import axios from "axios";

import { logger } from "#/lib/logger";

import type { ProviderInterface } from "#/features/exchange-providers/interface";
import type {
  Coin,
  GetKLineData,
  GetPositionHistoryProps,
  KLine,
  OpenPosition,
  Trade,
} from "#/features/exchange-providers/types";
import type {
  KLineData,
  KLineResponse,
  UserFillOrdersResponse,
  UserPositionHistoryResponse,
  UserPositionResponse,
} from "#/features/exchange-providers/bingx/types";

const USDT_HOST = process.env.USDT_HOST ?? "open-api.bingx.com";
const VST_HOST = process.env.VST_HOST ?? "open-api-vst.bingx.com";

const log = logger.child({ name: "BingxProvider" });

// ── Signing ────────────────────────────────────────────

function sign(
  payload: Record<string, string | number>,
  timestamp: number,
  secretKey: string,
): string {
  let params = "";
  for (const key in payload) {
    params += `${key}=${payload[key]}&`;
  }
  params += `timestamp=${timestamp}`;

  return crypto.createHmac("sha256", secretKey).update(params).digest("hex");
}

async function makeRequest({
  apiKey,
  secretKey,
  path,
  payload = {},
  coin,
}: {
  apiKey: string;
  secretKey: string;
  path: string;
  payload?: Record<string, string | number>;
  coin?: Coin;
}): Promise<any> {
  const host = coin === "VST" ? VST_HOST : USDT_HOST;
  const timestamp = Date.now();
  const signature = sign(payload, timestamp, secretKey);

  const queryString = Object.entries({ ...payload, timestamp })
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}&`)
    .join("")
    .slice(0, -1);

  const url = `https://${host}${path}?${queryString}&signature=${signature}`;

  const { data } = await axios.get(url, {
    headers: { "X-BX-APIKEY": apiKey },
    timeout: 10_000,
  });

  return data;
}

// ── Provider class ─────────────────────────────────────

export class BingxProvider implements ProviderInterface {
  private apiKey: string;
  private secretKey: string;
  private BATCH_SIZE = 5;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async areApiKeysValid(_coin?: Coin): Promise<boolean> {
    try {
      const data = await makeRequest({
        apiKey: this.apiKey,
        secretKey: this.secretKey,
        path: "/openApi/swap/v3/user/balance",
      });
      log.debug(
        { method: "areApiKeysValid", payload: {}, response: data },
        "provider response",
      );
      return data.code === 0;
    } catch {
      return false;
    }
  }

  async getOpenPositions(coin: Coin): Promise<OpenPosition[]> {
    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: "/openApi/swap/v2/user/positions",
      coin,
    })) as UserPositionResponse;

    log.debug(
      { method: "getOpenPositions", payload: {}, response },
      "provider response",
    );

    return response.data.map((position) => ({
      symbol: position.symbol,
      openTime: new Date(position.createTime),
      leverage: position.leverage,
      positionSide: position.positionSide,
      realisedProfit: position.realisedProfit,
      unrealizedProfit: position.unrealizedProfit,
      coin,
      pnlRatio: position.pnlRatio,
      margin: position.margin,
    }));
  }

  async getPositionHistory({
    coin,
    lastSyncTime,
  }: GetPositionHistoryProps): Promise<Partial<Trade>[]> {
    const filledOrders = await this.fetchFilledOrders({ coin, lastSyncTime });
    const symbolsToFetch = this.processFilledOrders(filledOrders);

    if (symbolsToFetch.length === 0) return [];

    const batches: string[][] = [];
    for (let i = 0; i < symbolsToFetch.length; i += this.BATCH_SIZE) {
      batches.push(symbolsToFetch.slice(i, i + this.BATCH_SIZE));
    }

    const allPositionHistories: Partial<Trade>[] = [];

    for (const [index, batch] of batches.entries()) {
      const batchResults = await Promise.all(
        batch.map((symbol) =>
          this.fetchPositionHistory({ coin, symbol, lastSyncTime })
            .then((r) => {
              return (
                r.data.positionHistory?.map((ph) => ({
                  ...ph,
                  openTime: new Date(ph.openTime),
                  updateTime: new Date(ph.updateTime),
                  coin,
                  type: "P" as const,
                })) || []
              );
            })
            .catch(() => []),
        ),
      );

      allPositionHistories.push(...(batchResults.flat() as Partial<Trade>[]));

      if (index < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return allPositionHistories;
  }

  async getKLine({
    coin,
    symbol,
    startTime,
    interval = "1h",
  }: GetKLineData): Promise<KLine[]> {
    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: "/openApi/swap/v3/quote/klines",
      payload: { symbol, interval, startTime, limit: 500 },
      coin,
    })) as KLineResponse;

    log.debug(
      {
        method: "getKLine",
        payload: { symbol, interval, startTime, limit: 500 },
        response,
      },
      "provider response",
    );

    return mapKLineData(response.data);
  }

  // ── Private helpers ──────────────────────────────────

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

    return { startTs, endTs: actualDate };
  }

  private getTimeRangeForFetchPositionsHistory(lastSyncTime: number) {
    let startTs = lastSyncTime;
    const endTs = Date.now();

    if (!lastSyncTime) startTs = endTs - 90 * 24 * 60 * 60 * 1000;

    return { startTs, endTs };
  }

  private async fetchFilledOrders({
    coin,
    lastSyncTime,
  }: GetPositionHistoryProps) {
    const { startTs, endTs } =
      this.getTimeRangeForFetchFilledOrders(lastSyncTime);

    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: "/openApi/swap/v2/trade/allFillOrders",
      payload: { startTs, endTs },
      coin,
    })) as UserFillOrdersResponse;

    log.debug(
      { method: "fetchFilledOrders", payload: { startTs, endTs }, response },
      "provider response",
    );

    return response;
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

    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: "/openApi/swap/v1/trade/positionHistory",
      payload: { startTs, endTs, symbol },
      coin,
    })) as UserPositionHistoryResponse;

    log.debug(
      {
        method: "fetchPositionHistory",
        payload: { startTs, endTs, symbol },
        response,
      },
      "provider response",
    );

    return response;
  }

  private processFilledOrders(
    filledOrdersResult: UserFillOrdersResponse,
  ): string[] {
    if (
      !filledOrdersResult?.data?.fill_orders ||
      filledOrdersResult.data.fill_orders.length === 0
    ) {
      return [];
    }

    return [
      ...new Set(
        filledOrdersResult.data.fill_orders.map((order) => order.symbol),
      ),
    ];
  }
}

// ── Helpers ────────────────────────────────────────────

function mapKLineData(data: KLineData[]): KLine[] {
  return data.map((k) => ({
    open: k.open,
    close: k.close,
    high: k.high,
    low: k.low,
    volume: k.volume,
    time: k.time,
  }));
}
