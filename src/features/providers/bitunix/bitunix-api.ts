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
import { makeRequest } from "./bitunix-base";
import type {
  HistoryPosition,
  HistoryPositionResponse,
  OpenPositionRespone,
} from "./bitunix-interfaces";

const PATHS = {
  HISTORY_POSITIONS: "/api/v1/futures/position/get_history_positions",
  PENDING_POSITONS: "/api/v1/futures/position/get_pending_positions",
  SINGLE_ACCOUNT: "/api/v1/futures/account",
};

export class BitunixProvider implements ProviderInterface {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async areApiKeysValid(coin: Coin): Promise<boolean> {
    const accountBalance = await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.SINGLE_ACCOUNT,
      params: {
        marginCoin: coin,
      },
    });

    return accountBalance.code === 0;
  }

  async getKLine(props: GetKLineData) {
    ///
    return [];
  }

  async getPositionHistory({
    lastSyncTime,
    coin,
  }: GetPositionHistoryProps): Promise<Partial<Trade>[]> {
    const params = this.getTimeRangeForGetPositionHistory(lastSyncTime);

    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.HISTORY_POSITIONS,
      params,
    })) as HistoryPositionResponse;

    return response.data.positionList.map((bitunixPosition) => {
      // TODO: idk if this is correct
      const closeAllPositions = bitunixPosition.qty === bitunixPosition.maxQty;
      const realizedPNL = parseFloat(bitunixPosition.realizedPNL);
      const fee = parseFloat(bitunixPosition.fee);
      const funding = parseFloat(bitunixPosition.funding);
      const netProfit = realizedPNL + fee + funding;

      return {
        type: "P",
        positionId: bitunixPosition.positionId,
        symbol: this.formatSymbol(bitunixPosition.symbol),
        isolated: bitunixPosition.marginMode === "ISOLATION",
        positionSide: this.formatPositionSide(bitunixPosition.side),
        openTime: new Date(Number(bitunixPosition.ctime)),
        updateTime: new Date(Number(bitunixPosition.mtime)),
        avgPrice: bitunixPosition.entryPrice,
        avgClosePrice: bitunixPosition.closePrice,
        realisedProfit: bitunixPosition.realizedPNL,
        netProfit: netProfit.toString(),
        positionAmt: bitunixPosition.qty,
        closePositionAmt: bitunixPosition.qty,
        leverage: Number(bitunixPosition.leverage),
        closeAllPositions,
        positionCommission: bitunixPosition.fee,
        totalFunding: bitunixPosition.funding,
        coin,
      };
    });
  }

  async getOpenPositions(_: Coin): Promise<OpenPosition[]> {
    const response = (await makeRequest({
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      path: PATHS.PENDING_POSITONS,
    })) as OpenPositionRespone;

    return response.data.map((pendingPosition) => ({
      symbol: this.formatSymbol(pendingPosition.symbol),
      openTime: new Date(Number(pendingPosition.ctime)),
      leverage: Number(pendingPosition.leverage),
      positionSide: this.formatPositionSide(pendingPosition.side),
    }));
  }

  // own methods to standardize

  private formatSymbol(symbol: string) {
    return symbol.replace(/(USDT)$/, "-$1");
  }

  private formatPositionSide(side: HistoryPosition["side"]): "LONG" | "SHORT" {
    return side === "BUY" ? "LONG" : "SHORT";
  }

  private getTimeRangeForGetPositionHistory(
    lastSyncTime: number,
  ): Record<string, number> {
    if (!lastSyncTime) return {};

    return {
      startTime: lastSyncTime,
      endTime: Date.now(),
    };
  }
}
