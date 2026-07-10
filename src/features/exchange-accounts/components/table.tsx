import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useAccounts } from '#/features/exchange-accounts/context'
import { useGetAccounts } from '#/features/exchange-accounts/hooks/use-exchange-accounts'
import { m } from '#/paraglide/messages'
import { ProviderImage } from '#/features/exchange-accounts/components/provider-image'
import type { AccountItem } from '#/features/exchange-accounts/types'

import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Edit, Trash } from 'lucide-react'
import { Skeleton } from '#/components/ui/skeleton'

const columnHelper = createColumnHelper<AccountItem>()

function RowActions({ row }: { row: { original: AccountItem } }) {
  const { setOpen, setCurrentRow } = useAccounts()

  return (
    <div className="flex gap-1 justify-end">
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

export function AccountsTable() {
  const { data = [], isLoading } = useGetAccounts()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => m['accounts.name'](),
        cell: (info) => (
          <div className="font-medium">{info.getValue()}</div>
        ),
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.accessor('provider', {
        header: () => m['accounts.provider'](),
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <ProviderImage provider={info.getValue()} />
            <span className="capitalize">{info.getValue()}</span>
          </div>
        ),
        meta: { className: 'text-center' } as const,
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => <RowActions row={row as { original: AccountItem }} />,
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
        {m['accounts.no_accounts_description']()}
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
