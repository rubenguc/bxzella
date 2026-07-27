import { lazy, Suspense, useState } from "react"
import { Download } from "lucide-react"

import { m } from "#/paraglide/messages"
import { Button } from "#/components/ui/button"
import { SyncButton } from "#/features/trades/components/sync-button"
import type { Coin } from "#/features/exchange-providers/types"

const ExportTradesDialog = lazy(() =>
  import("./export-dialog").then((mod) => ({ default: mod.ExportTradesDialog })),
)

interface Props {
  accountId: string
  coin: Coin
  accountName: string
}

export function TradesToolbar({ accountId, coin, accountName }: Props) {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex items-center justify-between gap-2">
      <SyncButton accountId={accountId} coin={coin} />
      <Button variant="outline" onClick={() => setExportOpen(true)}>
        <Download className="size-4 mr-2" />
        {m["trade_export.export_button"]()}
      </Button>

      <Suspense fallback={null}>
        <ExportTradesDialog
          accountId={accountId}
          coin={coin}
          accountName={accountName}
          open={exportOpen}
          onOpenChange={setExportOpen}
        />
      </Suspense>
    </div>
  )
}