import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useUserConfigStore } from "@/store/user-config-store";
import { SelectTrigger } from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Coin } from "@/global-interfaces";

const COINS = [
  {
    label: "VST",
    isDisabled: false,
    image: "/assets/coins/VST.webp",
  },
  {
    label: "USDT",
    isDisabled: true,
    image: "/assets/coins/USDT.webp",
  },
];

const getCoinImage = (coin: Coin) => {
  const coinData = COINS.find((c) => c.label === coin);
  return coinData ? coinData.image : "/assets/coins/VST.webp";
};

export function AccountsCoinSelector() {
  const t = useTranslations("header");
  const { coin, setCoin } = useUserConfigStore();

  const handleSelect = (value: Coin) => {
    setCoin(value);
  };

  return (
    <Select value={coin} onValueChange={handleSelect}>
      <SelectTrigger className="relative min-h-9 py-1 px-2 w-fit border rounded-full flex items-center gap-1  overflow-x-hidden text-nowrap">
        <SelectPrimitive.Icon asChild className="block md:hidden ">
          <Image src={getCoinImage(coin)} alt="coin" width={20} height={20} />
        </SelectPrimitive.Icon>
        <SelectValue className="hola" placeholder={t("select_coin")} />
        <SelectPrimitive.Icon asChild className="hidden md:block">
          <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
        </SelectPrimitive.Icon>
      </SelectTrigger>
      <SelectContent>
        {COINS?.map((_coin) => (
          <SelectItem
            key={_coin.label}
            value={_coin.label}
            disabled={_coin.isDisabled}
          >
            <div className="flex items-center gap-1.5">
              <Image
                src={getCoinImage(_coin.label as Coin)}
                alt="coin"
                width={20}
                height={20}
              />
              <span>{_coin.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
