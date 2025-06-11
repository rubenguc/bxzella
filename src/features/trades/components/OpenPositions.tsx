"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkLongPosition, transformSymbol } from "@/utils/trade-utils";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

const MOCK_DATA = [
  {
    date: "2023-01-01",
    symbol: "AAPL",
    volume: 100,
  },
  {
    date: "2023-01-02",
    symbol: "GOOGL",
    volume: 200,
  },
];

async function fetchOpenPositions(uid: string) {
  const res = await fetch(`/api/trades/open-positions?account_id=${uid}`);
  return res.json();
}

export function OpenPositions() {
  const { selectedAccountId } = useUserConfigStore();

  const columns: ColumnDef[] = [
    {
      header: "Open date",
      accessorKey: "date",
      cell: ({ row }) => {
        const date = row.original.createTime;
        return <>{transformTimeToLocalDate(date)}</>;
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Position",
      accessorKey: "positionSide",
      cell: ({ row }) => {
        const symbol = row.original.positionSide;
        const isLongPosition = checkLongPosition(symbol);
        return (
          <Badge variant={isLongPosition ? "green-outline" : "red-outline"}>
            {symbol}
          </Badge>
        );
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Symbol",
      accessorKey: "symbol",
      cell: ({ row }) => {
        const symbol = transformSymbol(row.original.symbol);
        return <div className="font-medium">{symbol}</div>;
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Volume",
      accessorKey: "positionValue",
      cell: ({ row }) => {
        const volume = row.original.positionValue;
        const currency = row.original.currency;
        return (
          <>
            {volume} {currency}
          </>
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["open-positions", selectedAccountId],
    queryFn: () => fetchOpenPositions(selectedAccountId),
    enabled: !!selectedAccountId,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open positions</CardTitle>
        <CardDescription>
          {"currently open positions, these don't depend on the time range"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      aria-colspan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ""}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
