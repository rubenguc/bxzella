import { SyncButton } from "#/features/trades/components/sync-button"
import type { Coin } from "#/features/exchange-providers/types"

interface Props {
  accountId: string
  coin: Coin
}

export function TradesToolbar({ accountId, coin }: Props) {
  return (
    <div className="flex items-center gap-2">
      <SyncButton accountId={accountId} coin={coin} />
    </div>
  )
}