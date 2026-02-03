"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CustomTable } from "@/components/custom-table";
import { Profit } from "@/components/profit";
import type { OpenPosition } from "@/features/trades/interfaces/trades-interfaces";
import { getOpenPositions } from "@/features/trades/services/trades-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkLongPosition, transformSymbol } from "@/utils/trade-utils";

// this is because the rate limit of this API is 10/second
// reference: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20position%20data
const AUTO_REFRESH_INTERVAL = 10000;

export function OpenPositions() {
  const t = useTranslations("dashboard.open_positions");
  const tInfo = useTranslations("trade_info");

  const { selectedAccount, coin } = useUserConfigStore();

  const columns: ColumnDef<OpenPosition>[] = [
    {
      header: tInfo("open_date"),
      accessorKey: "openTime",
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
        const position = row.original.positionSide;
        const isLongPosition = checkLongPosition(position);
        const leverage = row.original.leverage;
        return (
          <span>
            <strong
              className={`capitalize ${isLongPosition ? "text-green-500" : "text-red-500"}`}
            >
              {position.toLowerCase()}
            </strong>{" "}
            {`${leverage}x`}
          </span>
        );
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("realisedProfit"),
      accessorKey: "realisedProfit",
      cell: ({ row }) => {
        return (
          <Profit
            amount={Number(row.original.realisedProfit)}
            coin={row.original.coin}
            decimals={4}
          />
        );
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("unrealizedProfit"),
      accessorKey: "unrealizedProfit",
      cell: ({ row }) => {
        const unrealizedProfit = Number(row.original.unrealizedProfit);
        const margin = Number(row.original.margin);
        const ratio =
          margin > 0 ? ((unrealizedProfit / margin) * 100).toFixed(2) : "0.00";
        return (
          <Profit
            amount={unrealizedProfit}
            coin={row.original.coin}
            decimals={4}
            postfix={` (${ratio}%)`}
          />
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "openTime",
      desc: true,
    },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["open-positions", selectedAccount?._id, coin],
    queryFn: () =>
      getOpenPositions({
        accountId: selectedAccount!._id,
        coin,
      }),
    enabled: !!selectedAccount?._id,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <CustomTable
      table={table}
      columnsLength={columns.length}
      noDataMessage={t("no_open_positions")}
      showSkeleton={!data || isLoading}
    />
  );
}
