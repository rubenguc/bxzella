import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useSubscriptions } from '#/features/ai-summary-subscriptions/context'
import { useGetSubscriptions } from '#/features/ai-summary-subscriptions/hooks/use-ai-summary-subscriptions'
import { m } from '#/paraglide/messages'
import type { SubscriptionWithAccount } from '#/features/ai-summary-subscriptions/types'
import { COIN_LABELS, PROVIDER_INFO } from '#/features/exchange-providers/types'

import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Badge } from '#/components/ui/badge'
import { Switch } from '#/components/ui/switch'
import { Trash } from 'lucide-react'
import { Skeleton } from '#/components/ui/skeleton'
import { toggleSubscriptionAction } from '#/features/ai-summary-subscriptions/server-actions'
import { useQueryClient } from '@tanstack/react-query'

const columnHelper = createColumnHelper<SubscriptionWithAccount>()

function RowActions({ row }: { row: { original: SubscriptionWithAccount } }) {
  const { setOpen, setCurrentRow } = useSubscriptions()
  const queryClient = useQueryClient()

  const handleToggle = async (checked: boolean) => {
    await toggleSubscriptionAction({
      data: { id: row.original.id, isActive: checked },
    })
    await queryClient.invalidateQueries({ queryKey: ['ai-summary-subscriptions'] })
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Switch
        checked={row.original.isActive}
        onCheckedChange={handleToggle}
      />
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

export function SubscriptionsTable() {
  const { data = [], isLoading } = useGetSubscriptions()

  const columns = useMemo(
    () => [
      columnHelper.accessor('accountName', {
        header: () => m['ai_summary.account'](),
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center justify-center gap-2 font-medium">
              <img
                src={PROVIDER_INFO[row.accountProvider as keyof typeof PROVIDER_INFO]?.image}
                alt={row.accountProvider}
                width={20}
                height={20}
                className="rounded-full object-cover shrink-0"
              />
              <span>{info.getValue()}</span>
            </div>
          );
        },
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('coin', {
        header: () => m['ai_summary.coin'](),
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <img
              src={`/assets/coins/${info.getValue()}.webp`}
              alt={info.getValue()}
              width={20}
              height={20}
              className="rounded-full object-cover shrink-0"
            />
            <Badge variant="secondary">
              {COIN_LABELS[info.getValue()] ?? info.getValue()}
            </Badge>
          </div>
        ),
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('includeNotebook', {
        header: () => m['ai_summary.include_notebook'](),
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-400">
              {m['ai_summary.yes']()}
            </Badge>
          ) : (
            <Badge variant="outline">
              {m['ai_summary.no']()}
            </Badge>
          ),
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('isActive', {
        header: () => m['ai_summary.active'](),
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-600">
              {m['ai_summary.active_label']()}
            </Badge>
          ) : (
            <Badge variant="outline">
              {m['ai_summary.inactive_label']()}
            </Badge>
          ),
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => (
          <RowActions row={row as { original: SubscriptionWithAccount }} />
        ),
        meta: { className: 'text-center' } as const,
      }),
    ],
    [],
  )

  const stableData = useMemo(() => data, [data])

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

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        {m['ai_summary.no_subscriptions_description']()}
      </p>
    )
  }

  return (
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
  )
}
