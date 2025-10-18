"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { CustomTable } from "@/components/custom-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function RecentTrades() {
  const t = useTranslations("dashboard.recent_trades");
  const tInfo = useTranslations("trade_info");

  const { selectedAccountId, coin, startDate, endDate, isStoreLoaded } =
    useUserConfigStore();

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
      cell: ({ row }) => {
        const netProfit = row.original.netProfit;
        const isWin = checkWin(netProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {formatDecimal(Number(netProfit), 4)} {coin}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<
    PaginationResponseWithSync<TradeDocument>
  >({
    queryKey: ["all-trades", selectedAccountId, startDate, endDate, coin],
    enabled: isStoreLoaded && !!selectedAccountId && !!startDate && !!endDate,
    queryFn: async () => {
      const response = await getTrades({
        accountUID: selectedAccountId,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        limit: 10,
        page: 0,
        coin,
      });
      if (response.synced) {
        queryClient.invalidateQueries({ queryKey: ["statistics"] });
        queryClient.invalidateQueries({ queryKey: ["day-profits"] });
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
    <Card>
      <CardHeader>
        <CardTitle>{t("recent_trades")}</CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <CustomTable
          table={table}
          columnsLength={columns.length}
          noDataMessage={t("no_recent_trades")}
          showSkeleton={!data || isLoading}
        />
      </CardContent>
    </Card>
  );
}
