import crypto from "node:crypto";
import axios from "axios";

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
  HistoryPositionResponse,
  OpenPositionResponse,
} from "#/features/exchange-providers/bitunix/types";

const HOST = process.env.BITUNIX_HOST ?? "fapi.bitunix.com";

// ── Signing ────────────────────────────────────────────

function generateSignature(
  apiKey: string,
  secretKey: string,
  nonce: string,
  timestamp: string,
  queryParamsStr: string,
  body = "",
): string {
  const digest = crypto
    .createHash("sha256")
    .update(nonce + timestamp + apiKey + queryParamsStr + body)
    .digest("hex");

  return crypto
    .createHash("sha256")
    .update(digest + secretKey)
    .digest("hex");
}

function getAuthHeaders(
  apiKey: string,
  secretKey: string,
  params: Record<string, string | number> = {},
): Record<string, string> {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();

  const queryParamsStr = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");

  const sign = generateSignature(
    apiKey,
    secretKey,
    nonce,
    timestamp,
    queryParamsStr,
  );

  return {
    "api-key": apiKey,
    sign,
    nonce,
    timestamp,
  };
}

async function makeRequest({
  apiKey,
  secretKey,
  path,
  params = {},
}: {
  apiKey: string;
  secretKey: string;
  path: string;
  params?: Record<string, string | number>;
}): Promise<any> {
  const headers = getAuthHeaders(apiKey, secretKey, params);

  const { data } = await axios.get(`https://${HOST}${path}`, {
    headers: {
      language: "en-US",
      "Content-Type": "application/json",
      ...headers,
    },
    params: Object.keys(params).length > 0 ? params : undefined,
    timeout: 10_000,
  });

  return data;
}

// ── Provider class ─────────────────────────────────────

export class BitunixProvider implements ProviderInterface {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async areApiKeysValid(_coin?: Coin): Promise<boolean> {
    try {
      const data = await makeRequest({
        apiKey: this.apiKey,
        secretKey: this.secretKey,
        path: "/api/v1/futures/account",
        params: { marginCoin: _coin ?? "USDT" },
      });

      return data.code === 0;
    } catch (err) {
      return false;
    }
  }

  async getOpenPositions(_coin: Coin): Promise<OpenPosition[]> {
    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: "/api/v1/futures/position/get_pending_positions",
    })) as OpenPositionResponse;

    return response.data.map((position) => ({
      symbol: formatSymbol(position.symbol),
      openTime: new Date(Number(position.ctime)),
      leverage: Number(position.leverage),
      positionSide: formatPositionSide(position.side),
      realisedProfit: position.realizedPNL,
      unrealizedProfit: position.unrealizedPNL,
      coin: "USDT" as Coin,
      pnlRatio: "",
      margin: position.margin,
    }));
  }

  async getPositionHistory({
    lastSyncTime,
    coin,
  }: GetPositionHistoryProps): Promise<Partial<Trade>[]> {
    const params = getTimeRangeForGetPositionHistory(lastSyncTime);

    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: "/api/v1/futures/position/get_history_positions",
      params,
    })) as HistoryPositionResponse;

    return response.data.positionList.map((bitunixPosition) => {
      const realizedPNL = parseFloat(bitunixPosition.realizedPNL);
      const fee = parseFloat(bitunixPosition.fee);
      const funding = parseFloat(bitunixPosition.funding);
      const realisedProfit = realizedPNL + fee + funding;

      return {
        type: "P" as const,
        positionId: bitunixPosition.positionId,
        symbol: formatSymbol(bitunixPosition.symbol),
        isolated: bitunixPosition.marginMode === "ISOLATION",
        positionSide: formatPositionSide(bitunixPosition.side),
        openTime: new Date(Number(bitunixPosition.ctime)),
        updateTime: new Date(Number(bitunixPosition.mtime)),
        avgPrice: bitunixPosition.entryPrice,
        avgClosePrice: bitunixPosition.closePrice,
        realisedProfit: realisedProfit.toString(),
        netProfit: bitunixPosition.realizedPNL,
        positionAmt: bitunixPosition.qty,
        closePositionAmt: bitunixPosition.qty,
        leverage: Number(bitunixPosition.leverage),
        closeAllPositions: bitunixPosition.qty === bitunixPosition.maxQty,
        positionCommission: bitunixPosition.fee,
        totalFunding: bitunixPosition.funding,
        coin,
      };
    });
  }

  async getKLine({
    symbol,
    startTime,
    endTime,
    interval = "1h",
  }: GetKLineData): Promise<KLine[]> {
    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: "/api/v1/futures/market/kline",
      params: {
        symbol: transformSymbolToOriginal(symbol),
        interval,
        startTime,
        endTime,
        limit: 200,
      },
    })) as { code: number; data: KLine[] };

    return response.data;
  }
}

// ── Helpers ────────────────────────────────────────────

function formatSymbol(symbol: string): string {
  return symbol.replace(/(USDT)$/, "-$1");
}

function formatPositionSide(side: "BUY" | "SELL"): "LONG" | "SHORT" {
  return side === "BUY" ? "LONG" : "SHORT";
}

function transformSymbolToOriginal(symbol: string): string {
  return symbol.replace(/-(USDT)$/, "$1");
}

function getTimeRangeForGetPositionHistory(
  lastSyncTime: number,
): Record<string, number> {
  if (!lastSyncTime) return {};
  return { startTime: lastSyncTime, endTime: Date.now() };
}
