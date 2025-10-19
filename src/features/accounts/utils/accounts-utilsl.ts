import type { Coin } from "@/interfaces/global-interfaces";

export const DEFAULT_COINS_PROVIDER: {
  [key: string]: Partial<Record<Coin, number>>;
} = {
  bingx: {
    VST: 0,
    USDT: 0,
    USDC: 0,
  },
  bitunix: {
    USDT: 0,
  },
};
