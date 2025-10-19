import type { Trade } from "@/features/trades/interfaces/trades-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";

export interface GetPositionHistoryProps {
  startTs: number;
  endTs: number;
  coin: Coin;
}

export interface ProviderInterface {
  areApiKeysValid(coin: Coin): Promise<boolean>;
  getActivePositions(coin: Coin): Promise<void>;
  getPositionHistory(payload: GetPositionHistoryProps): Promise<Trade[]>;
}
