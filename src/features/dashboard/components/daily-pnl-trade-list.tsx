import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "#/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { m } from "#/paraglide/messages";
import type { DailyPnlTrade } from "#/features/dashboard/types";
import { checkLongPosition, transformSymbol } from "#/features/trades/helpers";
import { formatDecimal } from "#/lib/format-decimal";

interface DailyPnlTradeListProps {
  trades: DailyPnlTrade[];
}

export function DailyPnlTradeList({ trades }: DailyPnlTradeListProps) {
  const columns = useMemo<ColumnDef<DailyPnlTrade>[]>(
    () => [
      {
        header: m["trade_info.symbol"](),
        accessorKey: "symbol",
        cell: ({ row }) => (
          <div className="font-semibold">
            {transformSymbol(row.original.symbol)}
          </div>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.position"](),
        accessorKey: "positionSide",
        cell: ({ row }) => {
          const isLong = checkLongPosition(row.original.positionSide);
          return (
            <Badge
              variant="outline"
              className={
                isLong
                  ? "border-green-500 text-green-500"
                  : "border-red-500 text-red-500"
              }
            >
              {row.original.positionSide}
            </Badge>
          );
        },
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.leverage"](),
        accessorKey: "leverage",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.leverage}x</div>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.open_date"](),
        accessorKey: "openTime",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {format(new Date(row.original.openTime), "yyyy-MM-dd HH:mm")}
          </div>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.position_pnl"](),
        accessorKey: "netProfit",
        cell: ({ row }) => {
          const pnl = Number(row.original.netProfit);
          return (
            <span className={`font-semibold ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatDecimal(pnl, { precision: 4, suffix: "USDT" })}
            </span>
          );
        },
        meta: { className: "text-center" },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: trades ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (trades.length === 0) return null;

  return (
    <div className="rounded-lg border bg-muted/20 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {header.column.columnDef.header as string}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
