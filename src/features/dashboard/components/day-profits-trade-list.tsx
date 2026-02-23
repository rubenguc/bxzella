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
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkLongPosition, transformSymbol } from "@/utils/trade-utils";
import type { LimitedTrade } from "../interfaces/dashboard-interfaces";

interface DayProfitsTradeListProps {
  trades: LimitedTrade[];
}

export const DayProfitsTradeList = ({ trades }: DayProfitsTradeListProps) => {
  const tInfo = useTranslations("trade_info");
  const tCommon = useTranslationsCommon("common_messages");

  const columns: ColumnDef<LimitedTrade>[] = [
    {
      header: tInfo("symbol"),
      accessorKey: "symbol",
      cell: ({ row }) => (
        <div className="font-semibold">
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
          <Badge
            variant={isLongPosition ? "green-filled" : "red-filled"}
            className="min-w-[70px]"
          >
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
        <div className="font-medium text-muted-foreground">
          {row.original.leverage}x
        </div>
      ),
      meta: {
        className: "text-center",
      },
    },
    {
      header: tInfo("open_date"),
      accessorKey: "openTime",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {transformTimeToLocalDate(row.original.openTime)}
        </div>
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
          className="font-semibold"
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
          className="group inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors"
          aria-label={tCommon("aria_view_details")}
        >
          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      ),
    },
  ];

  const table = useReactTable({
    data: trades ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <CustomTable
      containerClassName="rounded-lg border bg-muted/20 overflow-hidden"
      table={table}
      columnsLength={columns.length}
      noDataMessage=""
    />
  );
};
