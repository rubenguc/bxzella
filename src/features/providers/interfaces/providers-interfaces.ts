import type {
  OpenPosition,
  Trade,
} from "@/features/trades/interfaces/trades-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";

export interface GetPositionHistoryProps {
  coin: Coin;
  lastSyncTime: number;
}

export interface ProviderInterface {
  areApiKeysValid(coin: Coin): Promise<boolean>;
  getOpenPositions(coin: Coin): Promise<OpenPosition[]>;
  getPositionHistory(
    payload: GetPositionHistoryProps,
  ): Promise<Partial<Trade>[]>;
}
