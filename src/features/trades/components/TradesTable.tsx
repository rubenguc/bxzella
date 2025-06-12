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
import { transformTimeToLocalDate } from "@/utils/date-utils";
import {
  checkLongPosition,
  checkWin,
  transformSymbol,
} from "@/utils/trade-utils";
import { useTranslations } from "next-intl";

async function fetchTrades(uid: string, page: number, limit?: number) {
  const res = await fetch(
    `/api/trades?account_id=${uid}&page=${page}&limit=${limit}`,
  );
  return res.json();
}

export function TradesTable() {
  const { selectedAccountId } = useUserConfigStore();
  const t = useTranslations("trades");
  const tInfo = useTranslations("trade_info");

  const columns: ColumnDef<ITradeModel>[] = [
    {
      header: tInfo("open_date"),
      accessorKey: "openTime",
      cell: ({ row }) => {
        const openTime = row.getValue("openTime") as string;
        return (
          <div className="font-medium">
            {transformTimeToLocalDate(openTime)}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },

    {
      header: tInfo("symbol"),
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
      header: tInfo("position"),
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
      header: tInfo("leverage"),
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
      header: tInfo("closed_date"),
      accessorKey: "updateTime",
      cell: ({ row }) => {
        const updateTime = row.getValue("updateTime") as string;
        return (
          <div className="font-medium">
            {transformTimeToLocalDate(updateTime)}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("avg_entry_price"),
      accessorKey: "avgPrice",
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("avg_exit_price"),
      accessorKey: "avgClosePrice",
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("position_pnl"),
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
      header: tInfo("realised_pnl"),
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
      header: tInfo("result"),
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
                  {t("no_trades")}
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
