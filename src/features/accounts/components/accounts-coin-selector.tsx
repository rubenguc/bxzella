import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { Coin } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import {
  getCoinAltText,
  getCoinImage,
  getCoinsToSelect,
} from "@/utils/accounts-utils";

export function AccountsCoinSelector() {
  const { coin, setCoin, selectedAccount } = useUserConfigStore();

  const handleSelect = (value: Coin) => {
    setCoin(value);
  };

  const COINS = getCoinsToSelect(selectedAccount?.provider) || [];

  return (
    <Select value={coin} onValueChange={handleSelect}>
      <SelectTrigger className="relative min-h-9 min-w-9 py-1 px-2 w-fit rounded-xl flex items-center justify-center overflow-x-hidden text-nowrap bg-card">
        <Image
          src={getCoinImage(coin)}
          alt={getCoinAltText(coin)}
          width={20}
          height={20}
        />
      </SelectTrigger>
      <SelectContent>
        {COINS.map((_coin) => (
          <SelectItem
            key={_coin.label}
            value={_coin.label}
            disabled={_coin.isDisabled}
          >
            <div className="flex items-center gap-1.5">
              <Image
                src={_coin.image}
                alt={getCoinAltText(_coin.label)}
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
