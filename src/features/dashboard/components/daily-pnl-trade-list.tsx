import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Pagination } from "#/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Eye } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { DailyPnlTrade } from "#/features/dashboard/types";
import { formatDate } from "#/lib/date-utils";
import { transformSymbol } from "#/features/trades/helpers";
import { PositionSide } from "#/features/trades/components/position-side";
import { Profit } from "#/components/Profit";

interface DailyPnlTradeListProps {
  trades: DailyPnlTrade[];
}

const PAGE_SIZE = 10;

export function DailyPnlTradeList({ trades }: DailyPnlTradeListProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(trades.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageTrades = useMemo(
    () => trades.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [trades, currentPage],
  );
  const hasNext = currentPage < totalPages - 1;
  const hasPrev = currentPage > 0;

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setPage((p) => Math.max(p - 1, 0));
  const goToPage = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));
  const firstPage = () => setPage(0);
  const lastPage = () => setPage(totalPages - 1);
  const columns = useMemo<ColumnDef<DailyPnlTrade>[]>(
    () => [
      {
        header: m["trade_info.symbol"](),
        accessorKey: "symbol",
        cell: ({ row }) => (
          <div className="font-semibold">
            {transformSymbol(row.original.symbol)}
          </div>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.side_leverage"](),
        accessorKey: "positionSide",
        cell: ({ row }) => (
          <PositionSide
            positionSide={row.original.positionSide}
            leverage={row.original.leverage}
          />
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.open_date"](),
        accessorKey: "openTime",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {formatDate(row.original.openTime)}
          </div>
        ),
        meta: { className: "text-center" },
      },
      {
        header: m["trade_info.position_pnl"](),
        accessorKey: "netProfit",
        cell: ({ row }) => <Profit netProfit={row.original.netProfit} />,
        meta: { className: "text-center" },
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <Button variant="ghost" size="icon" asChild>
            <Link
              to="/dashboard/trades/$positionId"
              params={{ positionId: row.original.positionId }}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        ),
        meta: { className: "text-center w-0" },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: pageTrades,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (trades.length === 0) return null;

  return (
    <div className="rounded-lg border bg-muted/20 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {header.column.columnDef.header as string}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="border-t px-4 py-2">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onNext={nextPage}
            onPrev={prevPage}
            onFirst={firstPage}
            onLast={lastPage}
            onGoTo={goToPage}
          />
        </div>
      )}
    </div>
  );
}
