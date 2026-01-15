"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { CustomTable } from "@/components/custom-table";
import { Profit } from "@/components/profit";
import { Badge } from "@/components/ui/badge";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { getTrades } from "@/features/trades/services/trades-services";
import type { PaginationResponseWithSync } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import {
  transformDateToParam,
  transformTimeToLocalDate,
} from "@/utils/date-utils";
import { checkLongPosition, transformSymbol } from "@/utils/trade-utils";

export function RecentTrades() {
  const t = useTranslations("dashboard.recent_trades");
  const tInfo = useTranslations("trade_info");
  const tCommon = useTranslationsCommon("common_messages");

  const {
    selectedAccount,
    coin,
    startDate,
    endDate,
    isStoreLoaded,
    updateLastSyncTime,
    updateEarliestTradeDate,
  } = useUserConfigStore();

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

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<
    PaginationResponseWithSync<TradeDocument>
  >({
    queryKey: ["all-trades", selectedAccount?._id, startDate, endDate, coin],
    enabled:
      isStoreLoaded && !!selectedAccount?._id && !!startDate && !!endDate,
    queryFn: async () => {
      toast.loading(t("syncing_new_trades"), {
        position: "top-right",
      });
      const response = await getTrades({
        accountId: selectedAccount!._id,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        limit: 10,
        page: 0,
        coin,
      });
      toast.dismiss();

      if (response.synced) {
        toast.success(t("new_trades_synced"), {
          position: "top-right",
        });
        queryClient.invalidateQueries({ queryKey: ["statistics"] });
        queryClient.invalidateQueries({ queryKey: ["day-profits"] });
        updateLastSyncTime(response.syncTime);
        if (response.earliestTradeDate) {
          updateEarliestTradeDate(response.earliestTradeDate);
        }
      }

      return response;
    },
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <CustomTable
      table={table}
      columnsLength={columns.length}
      noDataMessage={t("no_recent_trades")}
      showSkeleton={!data || isLoading}
    />
  );
}
