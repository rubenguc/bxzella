"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { CustomTable } from "@/components/custom-table";
import { Profit } from "@/components/profit";
import { Badge } from "@/components/ui/badge";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";

import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkLongPosition, transformSymbol } from "@/utils/trade-utils";
import { useRecentTrades } from "../context/recent-trades-context";

export function RecentTrades() {
  const { isLoading, recentTrades } = useRecentTrades();

  const t = useTranslations("dashboard.recent_trades");
  const tInfo = useTranslations("trade_info");
  const tCommon = useTranslationsCommon("common_messages");

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
        const positionSide = row.original.positionSide;
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
      header: tInfo("position_pnl"),
      accessorKey: "netProfit",
      cell: ({ row }) => (
        <Profit
          amount={Number(row.original.netProfit)}
          coin={row.original.coin}
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
          className="data-[state=open]:bg-muted h-auto"
          aria-label={tCommon("aria_view_details")}
        >
          <Eye className="w-4" />
        </Link>
      ),
    },
  ];

  const table = useReactTable({
    data: recentTrades,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <CustomTable
      table={table}
      columnsLength={columns.length}
      noDataMessage={t("no_recent_trades")}
      showSkeleton={!recentTrades || isLoading}
    />
  );
}
