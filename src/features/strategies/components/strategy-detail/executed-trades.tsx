import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Trash2, TriangleAlert } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { formatDate } from '#/lib/date-utils'
import { usePagination } from '#/lib/use-pagination'
import { Pagination } from '#/components/pagination'
import { Profit } from '#/components/Profit'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { transformSymbol } from '#/features/trades/helpers'
import { PositionSide } from '#/features/trades/components/position-side'
import type { Trade } from '#/features/trades/schema'
import { fetchStrategyTrades } from '#/features/strategies/service'
import { setTradeStrategyAction } from '#/features/strategies/server-actions'
import type { Coin } from '#/features/exchange-providers/types'

interface Props {
  strategyId: string
  accountId: string
  coin: Coin
}

export function StrategyExecutedTrades({ strategyId, accountId, coin }: Props) {
  const queryClient = useQueryClient()
  const [deleteRow, setDeleteRow] = useState<Trade | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const {
    items,
    page,
    totalPages,
    isLoading,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    firstPage,
    lastPage,
  } = usePagination<Trade>({
    queryKey: ['strategy-trades', strategyId, accountId, coin] as const,
    queryFn: (p, limit) => fetchStrategyTrades(strategyId, accountId, coin, p, limit),
    limit: 20,
    enabled: !!accountId,
  })

  const handleRemove = async () => {
    if (!deleteRow) return
    setIsRemoving(true)
    try {
      await setTradeStrategyAction({
        data: { tradeId: deleteRow.id, strategyId: null, checks: [] },
      })
      await queryClient.invalidateQueries({
        queryKey: ['strategy-trades', strategyId, accountId, coin],
      })
      await queryClient.invalidateQueries({ queryKey: ['strategies'] })
      await queryClient.invalidateQueries({
        queryKey: ['strategy-stats', strategyId, accountId, coin],
      })
      await queryClient.invalidateQueries({
        queryKey: ['strategy-rules', strategyId, accountId, coin],
      })
      toast.success(m['strategies.removed_trade_toast']())
      setDeleteRow(null)
    } finally {
      setIsRemoving(false)
    }
  }

  const rows = useMemo(() => items, [items])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        {m['strategies.no_trades']()}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">{m['trade_info.symbol']()}</TableHead>
              <TableHead className="text-center">{m['trade_info.side_leverage']()}</TableHead>
              <TableHead className="text-center">{m['trade_info.position_pnl']()}</TableHead>
              <TableHead className="text-center">{m['trade_info.open_date']()}</TableHead>
              <TableHead className="text-center">{m['trade_info.closed_date']()}</TableHead>
              <TableHead className="text-center w-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="text-center font-medium">
                  {transformSymbol(trade.symbol)}
                </TableCell>
                <TableCell className="text-center">
                  <PositionSide
                    positionSide={trade.positionSide}
                    leverage={trade.leverage}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Profit netProfit={trade.netProfit} />
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {formatDate(trade.openTime) || '—'}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {formatDate(trade.updateTime) || '—'}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteRow(trade)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        onNext={nextPage}
        onPrev={prevPage}
        onFirst={firstPage}
        onLast={lastPage}
        onGoTo={goToPage}
      />

      <Dialog
        open={deleteRow !== null}
        onOpenChange={(v) => !v && setDeleteRow(null)}
      >
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="h-5 w-5" />
              {m['strategies.remove_trade']()}
            </DialogTitle>
            <DialogDescription>
              {m['common_messages.are_your_sure_want_to_delete']()}{' '}
              <strong>{deleteRow ? transformSymbol(deleteRow.symbol) : ''}</strong>?
              <br />
              {m['strategies.remove_trade_warning']()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRow(null)} disabled={isRemoving}>
              {m['common_messages.cancel']()}
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isRemoving}>
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {m['common_messages.deleting_action']()}
                </>
              ) : (
                m['strategies.remove_trade']()
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}