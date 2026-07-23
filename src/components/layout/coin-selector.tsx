import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useUserConfig } from '#/store/user-config'
import type { Coin } from '#/features/exchange-providers/types'
import { getCoinsForProvider } from '#/features/exchange-providers/coins'

const ALL_COINS: Coin[] = ['USDT', 'VST']

const coinMetaMap: Record<string, { label: Coin; image: string }> =
  Object.fromEntries(
    ALL_COINS.map((c) => [c, { label: c, image: `/assets/coins/${c}.webp` }]),
  )

export function CoinSelector() {
  const { coin, setCoin, selectedAccount } = useUserConfig()

  const availableCoins = getCoinsForProvider(selectedAccount?.provider)

  return (
    <Select value={coin} onValueChange={(v) => setCoin(v as Coin)}>
      <SelectTrigger className="relative min-h-9 min-w-9 py-1 px-2 w-fit rounded-xl flex items-center justify-center overflow-x-hidden text-nowrap bg-card">
        <SelectValue placeholder="Coin">
          <img
            src={coinMetaMap[coin]?.image ?? '/assets/coins/USDT.webp'}
            alt={coin}
            width={20}
            height={20}
          />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableCoins.map((coin) => (
          <SelectItem key={coin} value={coin}>
            <div className="flex items-center gap-1.5">
              <img
                src={`/assets/coins/${coin}.webp`}
                alt={coin}
                width={20}
                height={20}
              />
              <span>{coin}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
