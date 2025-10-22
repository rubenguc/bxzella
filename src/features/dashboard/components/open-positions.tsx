"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { CustomTable } from "@/components/custom-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OpenPosition } from "@/features/trades/interfaces/trades-interfaces";
import { getOpenPositions } from "@/features/trades/services/trades-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkLongPosition, transformSymbol } from "@/utils/trade-utils";

export function OpenPositions() {
  const t = useTranslations("dashboard.open_positions");
  const tInfo = useTranslations("trade_info");

  const { selectedAccount, coin } = useUserConfigStore();

  const columns: ColumnDef<OpenPosition>[] = [
    {
      header: tInfo("open_date"),
      accessorKey: "date",
      cell: ({ row }) => {
        const date = row.original.openTime;
        return <>{transformTimeToLocalDate(date)}</>;
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
        const symbol = row.original.positionSide;
        const isLongPosition = checkLongPosition(symbol);
        return (
          <Badge variant={isLongPosition ? "green-filled" : "red-filled"}>
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
        const leverage = row.original.leverage;
        return <div className="font-medium">{leverage}x</div>;
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["open-positions", selectedAccount?._id, coin],
    queryFn: () =>
      getOpenPositions({
        accountId: selectedAccount!._id,
        coin,
      }),
    enabled: !!selectedAccount?._id,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("open_positions")}</CardTitle>
        <CardDescription>{t("open_positions_description")}</CardDescription>
      </CardHeader>
      <CardContent className="px-1">
        <CustomTable
          table={table}
          columnsLength={columns.length}
          noDataMessage={t("no_open_positions")}
          showSkeleton={!data || isLoading}
        />
      </CardContent>
    </Card>
  );
}
