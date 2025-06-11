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
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkLongPosition, checkWin } from "@/utils/trade-utils";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

async function fetchTrades(uid: string, page: number, limit?: number) {
  const res = await fetch(
    `/api/trades?account_id=${uid}&page=${page}&limit=${limit}`,
  );
  return res.json();
}

export function RecentTrades() {
  const { selectedAccountId } = useUserConfigStore();

  const columns: ColumnDef[] = [
    {
      header: "Open date",
      accessorKey: "openTime",
      cell: ({ row }) => {
        const openTime = row.getValue("openTime") as string;
        return (
          <div className="font-medium">
            {transformTimeToLocalDate(openTime)}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },

    {
      header: "Symbol",
      accessorKey: "symbol",
      cell: ({ row }) => {
        const symbol = (row.getValue("symbol") as string).split("-")?.[0] || "";
        return <div className="font-medium">{symbol}</div>;
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Position",
      accessorKey: "positionSide",
      cell: ({ row }) => {
        const symbol = row.getValue("positionSide") as string;
        const isLongPosition = checkLongPosition(symbol);
        return (
          <Badge variant={isLongPosition ? "green-outline" : "red-outline"}>
            {symbol}
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
      cell: ({ row }) => {
        const leverage = row.getValue("leverage") as number;
        return <div className="font-medium">{leverage}x</div>;
      },
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Position PnL",
      accessorKey: "netProfit",
      cell: ({ row }) => {
        const netProfit = row.getValue("netProfit") as string;
        const isWin = checkWin(netProfit);
        return (
          <div className={isWin ? "text-green-600" : "text-red-600"}>
            {netProfit}
          </div>
        );
      },
      meta: {
        className: "text-center",
      },
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", selectedAccountId],
    queryFn: () => fetchTrades(selectedAccountId, 0, 10),
    enabled: !!selectedAccountId,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent trades</CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      aria-colspan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ""}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
