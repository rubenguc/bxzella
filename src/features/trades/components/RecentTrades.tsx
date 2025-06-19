"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserConfigStore } from "@/store/user-config-store";
import {
  transformDateToParam,
  transformTimeToLocalDate,
} from "@/utils/date-utils";
import {
  checkLongPosition,
  checkWin,
  transformSymbol,
} from "@/utils/trade-utils";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { getTrades } from "../services/trades-services";
import { ITradeModel } from "../model/trades";
import { CustomTable } from "@/components/custom-table";

export function RecentTrades() {
  const t = useTranslations("dashboard.recent_trades");
  const { selectedAccountId, coin, startDate, endDate, isStoreLoaded } =
    useUserConfigStore();

  const columns: ColumnDef<ITradeModel>[] = [
    {
      header: "Open date",
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
      header: "Symbol",
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
      header: "Position",
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
      header: "Leverage",
      accessorKey: "leverage",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.leverage}x</div>
      ),
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Position PnL",
      accessorKey: "netProfit",
      cell: ({ row }) => {
        const netProfit = row.original.netProfit;
        const isWin = checkWin(netProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {netProfit} {coin}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", selectedAccountId, startDate, endDate, coin],
    queryFn: () =>
      getTrades({
        accountId: selectedAccountId,
        startDate: transformDateToParam(startDate!),
        endDate: transformDateToParam(endDate!),
        limit: 10,
        page: 0,
        coin,
      }),
    enabled: isStoreLoaded && !!selectedAccountId && !!startDate && !!endDate,
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
