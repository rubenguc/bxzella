import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useUserConfig } from '#/store/user-config'
import type { Coin } from '#/features/exchange-providers/types'

interface CoinMeta {
  label: Coin
  image: string
  disabled: boolean
}

const COINS: CoinMeta[] = [
  { label: 'USDT', image: '/assets/coins/USDT.webp', disabled: false },
  { label: 'VST', image: '/assets/coins/VST.webp', disabled: false },
]

/** Returns coins available for a given provider. */
function getCoinsForProvider(provider?: string): CoinMeta[] {
  if (!provider) return [COINS[0]]
  if (provider === 'bingx') return COINS
  if (provider === 'bitunix') return COINS.filter((c) => c.label === 'USDT')
  return [COINS[0]]
}

const coinMetaMap: Record<string, CoinMeta> = Object.fromEntries(
  COINS.map((c) => [c.label, c]),
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
        {availableCoins.map((c) => (
          <SelectItem key={c.label} value={c.label} disabled={c.disabled}>
            <div className="flex items-center gap-1.5">
              <img src={c.image} alt={c.label} width={20} height={20} />
              <span>{c.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
