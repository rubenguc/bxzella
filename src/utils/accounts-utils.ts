import type { Coin, Provider } from "@/interfaces/global-interfaces";

const COINS = [
  {
    label: "USDT" as Coin,
    isDisabled: false,
    image: "/assets/coins/USDT.webp",
  },
  {
    label: "VST" as Coin,
    isDisabled: false,
    image: "/assets/coins/VST.webp",
  },
];

export const getCoinsToSelect = (provider?: Provider) => {
  if (!provider) return [COINS[0]];
  if (provider === "bingx") return COINS;

  if (provider === "bitunix")
    return COINS.filter((coin) => coin.label === "USDT");
};

export const getCoinImage = (coin: Coin) => {
  const coinData = COINS.find((c) => c.label === coin);
  return coinData ? coinData.image : "/assets/coins/VST.webp";
};

export const getCoinAltText = (coin: Coin) => {
  return `${coin} cryptocurrency logo`;
};
