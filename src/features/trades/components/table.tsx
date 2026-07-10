import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";
import { formatDate } from "#/lib/date-utils";
import { usePagination } from "#/lib/use-pagination";
import { Pagination } from "#/components/pagination";
import { Button } from "#/components/ui/button";
import { Profit } from "#/components/Profit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import type { TradeItem } from "#/features/trades/types";
import { transformSymbol } from "#/features/trades/helpers";
import { PositionSide } from "#/features/trades/components/position-side";
import { fetchTrades } from "#/features/trades/service";
import type { Coin } from "#/features/exchange-providers/types";

interface Props {
  accountId: string;
  coin: Coin;
}

export function TradesTable({ accountId, coin }: Props) {
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
  } = usePagination({
    queryKey: ["trades", accountId, coin] as const,
    queryFn: (p, limit) => fetchTrades(accountId, coin, p, limit),
    limit: 20,
    enabled: !!accountId,
  });

  const columns = useMemo<ColumnDef<TradeItem>[]>(
    () => [
      {
        header: m["trade_info.symbol"](),
        accessorKey: "symbol",
        cell: ({ row }) => (
          <span className="font-medium">{transformSymbol(row.original.symbol)}</span>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.side_leverage"](),
        accessorKey: "positionSide",
        cell: ({ row }) => (
          <PositionSide
            positionSide={row.original.positionSide}
            leverage={row.original.leverage}
          />
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.avg_entry_price"](),
        accessorKey: "avgPrice",
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.avg_exit_price"](),
        accessorKey: "avgClosePrice",
        cell: ({ row }) => <>{row.original.avgClosePrice ?? "—"}</>,
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.position_pnl"](),
        accessorKey: "netProfit",
        cell: ({ row }) => <Profit netProfit={row.original.netProfit} />,
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.open_date"](),
        accessorKey: "openTime",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.openTime) || "—"}
          </span>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.closed_date"](),
        accessorKey: "updateTime",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.updateTime) || "—"}
          </span>
        ),
        meta: { className: "text-center" },
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <Button variant="ghost" size="icon" asChild>
            <Link
              to="/dashboard/trades/$positionId"
              params={{ positionId: row.original.positionId }}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        ),
        meta: { className: "text-center w-0" },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        {m["common_messages.loading"]()}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {m["trade_info.no_trades"]()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      (header.column.columnDef.meta as { className?: string })?.className ?? "text-center"
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
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
                      (cell.column.columnDef.meta as { className?: string })?.className ?? "text-center"
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
  );
}
