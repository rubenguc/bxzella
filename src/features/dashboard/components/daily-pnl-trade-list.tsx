import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Eye } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { DailyPnlTrade } from "#/features/dashboard/types";
import { formatDate } from "#/lib/date-utils";
import { checkLongPosition, transformSymbol } from "#/features/trades/helpers";
import { Profit } from "#/components/Profit";

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
            {formatDate(row.original.openTime)}
          </div>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.position_pnl"](),
        accessorKey: "netProfit",
        cell: ({ row }) => <Profit netProfit={row.original.netProfit} />,
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
