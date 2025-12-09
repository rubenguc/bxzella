import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("trades");
  const tInfo = useTranslations("trade_info");

  const columns: ColumnDef<LimitedTrade>[] = [
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

  const table = useReactTable({
    data: trades ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <CustomTable
        containerClassName="rounded-md border"
        table={table}
        columnsLength={columns.length}
        noDataMessage={t("no_trades")}
      />
    </div>
  );
};
