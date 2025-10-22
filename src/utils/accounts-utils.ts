import type { Provider } from "@/interfaces/global-interfaces";

const COINS = [
  {
    label: "USDT",
    isDisabled: false,
    image: "/assets/coins/USDT.webp",
  },
  {
    label: "VST",
    isDisabled: false,
    image: "/assets/coins/VST.webp",
  },
];

export const getCoinsToSelect = (provider: Provider) => {
  if (provider === "bingx") return COINS;

  if (provider === "bitunix")
    return COINS.filter((coin) => coin.label === "USDT");
};
