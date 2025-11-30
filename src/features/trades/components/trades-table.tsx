"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CustomTable } from "@/components/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTradeContext } from "@/features/trades/context/trades-context";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import {
  checkLongPosition,
  checkWin,
  transformSymbol,
} from "@/utils/trade-utils";
import { getTrades } from "../services/trades-services";

export function TradesTable() {
  const { selectedAccount, coin } = useUserConfigStore();
  const t = useTranslations("trades");
  const tInfo = useTranslations("trade_info");

  const { setCurrentTrade } = useTradeContext();

  const columns: ColumnDef<TradeDocument>[] = [
    {
      header: tInfo("open_date"),
      accessorKey: "openTime",
      cell: ({ row }) => (
        <div className="font-medium">
          {transformTimeToLocalDate(row.original.openTime)}
        </div>
      ),
      meta: {
        className: "text-center",
      },
    },

    {
      header: tInfo("symbol"),
      accessorKey: "symbol",
      cell: ({ row }) => (
        <div className="font-medium">
          {transformSymbol(row.original.symbol)}
        </div>
      ),
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("position"),
      accessorKey: "positionSide",
      cell: ({ row }) => {
        const positionSide = row.getValue("positionSide") as string;
        const isLongPosition = checkLongPosition(positionSide);
        return (
          <Badge variant={isLongPosition ? "green-filled" : "red-filled"}>
            {positionSide}
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
      cell: ({ row }) => (
        <div className="font-medium">{row.original.leverage}x</div>
      ),
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("closed_date"),
      accessorKey: "updateTime",
      cell: ({ row }) => (
        <div className="font-medium">
          {transformTimeToLocalDate(row.original.updateTime)}
        </div>
      ),
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
        const netProfit = row.original.netProfit;
        const isWin = checkWin(netProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {Number(netProfit)} {row.original.coin}
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
        const realisedProfit = row.original.realisedProfit;
        const isWin = checkWin(realisedProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {Number(realisedProfit)} {row.original.coin}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          onClick={() => setCurrentTrade(row.original)}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      ),
    },
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "all-trades",
      selectedAccount?._id,
      pagination.pageIndex,
      pagination.pageSize,
      coin,
    ],
    queryFn: () =>
      getTrades({
        accountId: selectedAccount!._id,
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        coin,
      }),
    enabled: !!selectedAccount?._id,
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
      <CustomTable
        containerClassName="rounded-md border"
        table={table}
        columnsLength={columns.length}
        noDataMessage={t("no_trades")}
        showSkeleton={!!selectedAccount && ((!data as boolean) || isLoading)}
        showPagination
      />
    </div>
  );
}
