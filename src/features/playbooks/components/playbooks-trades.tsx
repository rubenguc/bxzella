import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { CustomTable } from "@/components/custom-table";
import { Badge } from "@/components/ui/badge";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { usePagination } from "@/hooks/use-pagination";
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
import { getTradesByPlaybookId } from "../services/playbooks-services";

interface PlaybooksTradesProps {
  id: string;
}

export function PlaybooksTrades({ id }: PlaybooksTradesProps) {
  const tInfo = useTranslations("trade_info");

  const { selectedAccount, coin, startDate, endDate } = useUserConfigStore();
  const { limit, page, setPagination } = usePagination();

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
      header: tInfo("position_pnl"),
      accessorKey: "netProfit",
      cell: ({ row }) => {
        const netProfit = row.original.netProfit;
        const isWin = checkWin(netProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {formatDecimal(Number(netProfit), 4)} {row.original.coin}
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
            {formatDecimal(Number(realisedProfit), 4)} {row.original.coin}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["playbooks-trades", limit, page, id, selectedAccount?._id],
    queryFn: () =>
      getTradesByPlaybookId({
        playbookId: id,
        accountId: selectedAccount!._id,
        coin,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        limit,
        page,
      }),
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages,
    state: {
      pagination: {
        pageIndex: page,
        pageSize: limit,
      },
    },
    onPaginationChange: setPagination,
  });

  return (
    <CustomTable
      containerClassName="rounded-md border"
      table={table}
      columnsLength={columns.length}
      noDataMessage={tInfo("no_trades")}
      showSkeleton={!!selectedAccount?._id && ((!data as boolean) || isLoading)}
      showPagination
    />
  );
}
