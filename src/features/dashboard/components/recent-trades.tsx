"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CustomTable } from "@/components/custom-table";
import { Badge } from "@/components/ui/badge";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { getTrades } from "@/features/trades/services/trades-services";
import type { PaginationResponseWithSync } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import {
  transformDateToParam,
  transformTimeToLocalDate,
} from "@/utils/date-utils";
import { formatDecimal } from "@/utils/number-utils";
import {
  checkLongPosition,
  checkWin,
  transformSymbol,
} from "@/utils/trade-utils";
import { Profit } from "@/components/profit";

export function RecentTrades() {
  const t = useTranslations("dashboard.recent_trades");
  const tInfo = useTranslations("trade_info");

  const {
    selectedAccount,
    coin,
    startDate,
    endDate,
    isStoreLoaded,
    updateLastSyncTime,
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
