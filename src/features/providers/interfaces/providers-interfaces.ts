import type {
  OpenPosition,
  Trade,
} from "@/features/trades/interfaces/trades-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";
import type { KLine } from "../bingx/bingx-interfaces";

export interface GetPositionHistoryProps {
  coin: Coin;
  lastSyncTime: number;
}

export interface GetKLineData {
  coin: Coin;
  symbol: string;
  startTime: number;
  interval?: string;
}

export interface ProviderInterface {
  areApiKeysValid(coin: Coin): Promise<boolean>;
  getOpenPositions(coin: Coin): Promise<OpenPosition[]>;
  getPositionHistory(
    payload: GetPositionHistoryProps,
  ): Promise<Partial<Trade>[]>;
  getKLine: (payload: GetKLineData) => Promise<KLine[]>;
}
