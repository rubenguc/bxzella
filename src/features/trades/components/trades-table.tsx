"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CustomTable } from "@/components/custom-table";
import { Profit } from "@/components/profit";
import { Badge } from "@/components/ui/badge";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkLongPosition, transformSymbol } from "@/utils/trade-utils";
import { getTrades } from "../services/trades-services";

export function TradesTable() {
  const { selectedAccount, coin } = useUserConfigStore();
  const t = useTranslations("trades");
  const tInfo = useTranslations("trade_info");
  const tCommon = useTranslations("common_messages");

  const columns = useMemo<ColumnDef<TradeDocument>[]>(
    () => [
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
        cell: ({ row }) => (
          <Profit
            amount={Number(row.original.netProfit)}
            coin={row.original.coin}
            decimals={4}
          />
        ),
        meta: {
          className: "text-center",
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Link
            href={`/trades/details/${row.original.positionId}`}
            className="group inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
            aria-label={tCommon("aria_view_details")}
          >
            <Eye className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ),
      },
    ],
    [tInfo, tCommon],
  );

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
        containerClassName="rounded-xl border bg-card shadow-sm overflow-hidden"
        table={table}
        columnsLength={columns.length}
        noDataMessage={t("no_trades")}
        showSkeleton={!!selectedAccount && ((!data as boolean) || isLoading)}
        showPagination
      />
    </div>
  );
}
