import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Edit, Eye, Trash } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { usePagination } from '#/lib/use-pagination'
import { Pagination } from '#/components/pagination'
import { Profit } from '#/components/Profit'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { StrategyWithStats } from '#/features/strategies/types'
import { useStrategies } from '#/features/strategies/context'
import { fetchStrategies } from '#/features/strategies/service'
import type { Coin } from '#/features/exchange-providers/types'

const columnHelper = createColumnHelper<StrategyWithStats>()

interface Props {
  accountId: string
  coin: Coin
}

function RowActions({ row }: { row: { original: StrategyWithStats } }) {
  const { setOpen, setCurrentRow } = useStrategies()

  return (
    <div className="flex gap-1 justify-end">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/dashboard/strategies/$strategyId" params={{ strategyId: row.original.id }}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setCurrentRow(row.original)
          setOpen('edit')
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setCurrentRow(row.original)
          setOpen('delete')
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function StrategiesTable({ accountId, coin }: Props) {
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
  } = usePagination<StrategyWithStats>({
    queryKey: ['strategies', accountId, coin] as const,
    queryFn: (p, limit) => fetchStrategies(accountId, coin, p, limit),
    limit: 20,
    enabled: !!accountId,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: () => m['strategies.title'](),
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('description', {
        header: () => m['strategies.description'](),
        cell: (info) => {
          const value = info.getValue()
          return (
            <div className="text-sm text-muted-foreground max-w-[220px] truncate mx-auto">
              {value || '—'}
            </div>
          )
        },
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('totalTrades', {
        header: () => m['strategies.total_trades'](),
        cell: (info) => (
          <span className="tabular-nums">{info.getValue()}</span>
        ),
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('netPnL', {
        header: () => m['strategies.net_pnl'](),
        cell: (info) => <Profit netProfit={info.getValue()} />,
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('winRate', {
        header: () => m['strategies.win_rate'](),
        cell: (info) => (
          <span className="tabular-nums">{info.getValue().toFixed(1)}%</span>
        ),
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => <RowActions row={row as { original: StrategyWithStats }} />,
        meta: { className: 'text-center w-0' } as const,
      }),
    ],
    [],
  )

  const stableData = useMemo(() => items, [items])

  const table = useReactTable({
    data: stableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
        {m['strategies.no_strategies']()}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      (header.column.columnDef.meta as { className?: string })?.className ??
                      'text-center'
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      (cell.column.columnDef.meta as { className?: string })?.className ??
                      'text-center'
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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
    </div>
  )
}