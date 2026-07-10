import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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
import { m } from "#/paraglide/messages";
import type { OpenPosition } from "#/features/exchange-providers/types";
import { useUserConfig } from "#/store/user-config";
import { checkLongPosition, transformSymbol } from "#/features/trades/helpers";
import { formatDecimal } from "#/lib/format-decimal";
import { getOpenPositions } from "#/features/dashboard/service";

const AUTO_REFRESH_INTERVAL = 10000;

export function OpenPositions() {
  const { selectedAccount, coin } = useUserConfig();

  const [sorting, setSorting] = useState<SortingState>([
    { id: "unrealizedProfit", desc: true },
  ]);

  const columns = useMemo<ColumnDef<OpenPosition>[]>(
    () => [
      {
        header: m["trade_info.symbol"](),
        accessorKey: "symbol",
        cell: ({ row }) => {
          const symbol = transformSymbol(row.original.symbol);
          return <div className="font-medium">{symbol}</div>;
        },
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.position"](),
        accessorKey: "positionSide",
        cell: ({ row }) => {
          const isLong = checkLongPosition(row.original.positionSide);
          return (
            <span
              className={`font-medium capitalize ${isLong ? "text-green-500" : "text-red-500"}`}
            >
              {row.original.positionSide.toLowerCase()} {row.original.leverage}x
            </span>
          );
        },
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.realisedProfit"](),
        accessorKey: "realisedProfit",
        cell: ({ row }) => {
          const value = Number(row.original.realisedProfit);
          return (
            <span className={value >= 0 ? "text-green-500" : "text-red-500"}>
              {formatDecimal(value, { precision: 4 })} USDT
            </span>
          );
        },
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.unrealizedProfit"](),
        accessorKey: "unrealizedProfit",
        cell: ({ row }) => {
          const unrealized = Number(row.original.unrealizedProfit);
          const margin = Number(row.original.margin);
          const ratio =
            margin > 0 ? ((unrealized / margin) * 100).toFixed(2) : "0.00";
          return (
            <span
              className={unrealized >= 0 ? "text-green-500" : "text-red-500"}
            >
              {formatDecimal(unrealized, { precision: 4 })} USDT ({ratio}%)
            </span>
          );
        },
        meta: { className: "text-center" },
      },
    ],
    [],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["open-positions", selectedAccount?.id, coin],
    queryFn: () =>
      getOpenPositions({
        accountId: selectedAccount!.id,
        coin,
      }),
    enabled: !!selectedAccount?.id,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
        {m["dashboard.open_positions.no_open_positions"]()}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-card z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="text-center"
                onClick={header.column.getToggleSortingHandler()}
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
