import { useUserConfigStore } from "@/store/user-config-store";
import { useQuery } from "@tanstack/react-query";
import { getTradesByPlaybookId } from "../services/playbooks-services";
import {
  transformDateToParam,
  transformTimeToLocalDate,
} from "@/utils/date-utils";
import { usePagination } from "@/hooks/use-pagination";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { useTranslations } from "next-intl";
import {
  checkLongPosition,
  checkWin,
  transformSymbol,
} from "@/utils/trade-utils";
import { Badge } from "@/components/ui/badge";
import { formatDecimal } from "@/utils/number-utils";
import { CustomTable } from "@/components/custom-table";

interface PlaybooksTradesProps {
  id: string;
}

export function PlaybooksTrades({ id }: PlaybooksTradesProps) {
  const tInfo = useTranslations("trade_info");

  const { selectedAccountId, coin, startDate, endDate } = useUserConfigStore();
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
            {formatDecimal(Number(netProfit), 4)} {coin}
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
            {formatDecimal(Number(realisedProfit), 4)} {coin}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["playbooks-trades", limit, page],
    queryFn: () =>
      getTradesByPlaybookId(id, {
        accountId: selectedAccountId!,
        coin,
        startDate: transformDateToParam(startDate!),
        endDate: transformDateToParam(endDate!),
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
      showSkeleton={!!selectedAccountId && ((!data as boolean) || isLoading)}
      showPagination
    />
  );
}
