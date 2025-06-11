"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useUserConfigStore } from "@/store/user-config-store";
import { ITradeModel } from "../model/trades";
import { Badge } from "@/components/ui/badge";

async function fetchTrades(uid: string, page: number, limit?: number) {
  const res = await fetch(
    `/api/trades?account_id=${uid}&page=${page}&limit=${limit}`,
  );
  return res.json();
}

function formatTime(time: string) {
  const date = new Date(time);
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
}

function checkWin(amount: string) {
  return !amount.includes("-");
}

function checkLongPosition(positionSide: string) {
  return positionSide === "LONG";
}

export function TradesTable({}) {
  const { selectedAccountId } = useUserConfigStore();

  const columns: ColumnDef<ITradeModel>[] = [
    {
      header: "Open date",
      accessorKey: "openTime",
      cell: ({ row }) => {
        const openTime = row.getValue("openTime") as string;
        const formattedDate = formatTime(openTime);
        return <div className="font-medium">{formatTime(formattedDate)}</div>;
      },
      meta: {
        className: "text-center",
      },
    },

    {
      header: "Symbol",
      accessorKey: "symbol",
      cell: ({ row }) => {
        const symbol = (row.getValue("symbol") as string).split("-")?.[0] || "";
        return <div className="font-medium">{symbol}</div>;
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Position",
      accessorKey: "positionSide",
      cell: ({ row }) => {
        const symbol = row.getValue("positionSide") as string;
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
      header: "Leverage",
      accessorKey: "leverage",
      cell: ({ row }) => {
        const leverage = row.getValue("leverage") as number;
        return <div className="font-medium">{leverage}x</div>;
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Closed date",
      accessorKey: "updateTime",
      cell: ({ row }) => {
        const openTime = row.getValue("updateTime") as string;
        const formattedDate = formatTime(openTime);
        return <div className="font-medium">{formatTime(formattedDate)}</div>;
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Avg Entry price",
      accessorKey: "avgPrice",
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Avg Exit price",
      accessorKey: "avgClosePrice",
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Position PnL",
      accessorKey: "netProfit",
      cell: ({ row }) => {
        const netProfit = row.getValue("netProfit") as string;
        const isWin = checkWin(netProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {netProfit}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Realised PnL",
      accessorKey: "realisedProfit",
      cell: ({ row }) => {
        const netProfit = row.getValue("realisedProfit") as string;
        const isWin = checkWin(netProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {netProfit}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Result",
      cell: ({ row }) => {
        const netProfit = row.getValue("netProfit") as string;
        const isWin = checkWin(netProfit);
        return (
          <Badge variant={isWin ? "green-filled" : "red-filled"}>
            {isWin ? "Win" : "Loss"}
          </Badge>
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "accounts",
      selectedAccountId,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      fetchTrades(selectedAccountId, pagination.pageIndex, pagination.pageSize),
    enabled: !!selectedAccountId,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
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
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
