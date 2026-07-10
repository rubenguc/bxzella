import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";
import type { Trade } from "#/features/exchange-providers/types";
import { useUserConfig } from "#/store/user-config";
import { transformSymbol } from "#/features/trades/helpers";
import { PositionSide } from "#/features/trades/components/position-side";
import { formatDate } from "#/lib/date-utils";
import { Profit } from "#/components/Profit";
import { getRecentTrades } from "#/features/dashboard/service";
import { Eye } from "lucide-react";

export function RecentTrades() {
  const { selectedAccount, coin } = useUserConfig();

  const columns = useMemo<ColumnDef<Trade>[]>(
    () => [
      {
        header: m["trade_info.open_date"](),
        accessorKey: "openTime",
        cell: ({ row }) => (
          <span className="font-medium">
            {formatDate(row.original.openTime)}
          </span>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.closed_date"](),
        accessorKey: "updateTime",
        cell: ({ row }) => (
          <span className="font-medium">
            {formatDate(row.original.updateTime)}
          </span>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.symbol"](),
        accessorKey: "symbol",
        cell: ({ row }) => (
          <span className="font-medium">
            {transformSymbol(row.original.symbol)}
          </span>
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

  const { data, isLoading } = useQuery({
    queryKey: ["recent-trades", selectedAccount?.id, coin],
    queryFn: () =>
      getRecentTrades({
        accountId: selectedAccount!.id,
        coin,
      }),
    enabled: !!selectedAccount?.id,
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {m["common_messages.loading"]()}
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {m["dashboard.recent_trades.no_recent_trades"]()}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-card z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="text-center">
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
              <TableCell key={cell.id} className="text-center">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
