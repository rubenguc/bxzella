import { m } from "#/paraglide/messages";
import { usePagination } from "#/lib/use-pagination";
import { Pagination } from "#/components/pagination";
import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import type { Coin } from "#/features/exchange-providers/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { fetchTrades } from "#/features/trades/service";
import { transformSymbol } from "#/features/trades/helpers";

interface Props {
  accountId: string;
  coin: Coin;
}

export function TradesTable({ accountId, coin }: Props) {
  const {
    items,
    page,
    totalPages,
    isLoading,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    firstPage,
    lastPage,
  } = usePagination({
    queryKey: ["trades", accountId, coin] as const,
    queryFn: (p, limit) => fetchTrades(accountId, coin, p, limit),
    limit: 20,
    enabled: !!accountId,
  });

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        {m["common_messages.loading"]()}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {m["trade_info.no_trades"]()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{m["trade_info.symbol"]()}</TableHead>
              <TableHead>{m["trade_info.side"]()}</TableHead>
              <TableHead>{m["trade_info.leverage"]()}</TableHead>
              <TableHead>{m["trade_info.avg_entry_price"]()}</TableHead>
              <TableHead>{m["trade_info.avg_exit_price"]()}</TableHead>
              <TableHead>{m["trade_info.realised_pnl"]()}</TableHead>
              <TableHead>{m["trade_info.open_date"]()}</TableHead>
              <TableHead>{m["trade_info.closed_date"]()}</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{transformSymbol(t.symbol)}</TableCell>
                <TableCell>
                  {t.positionSide === "LONG" || t.positionSide === "long"
                    ? m["trade_info.long"]()
                    : m["trade_info.short"]()}
                </TableCell>
                <TableCell>{t.leverage}x</TableCell>
                <TableCell>{t.avgPrice}</TableCell>
                <TableCell>{t.avgClosePrice ?? "—"}</TableCell>
                <TableCell
                  className={
                    Number(t.realisedProfit) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {Number(t.realisedProfit).toFixed(2)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {t.openTime ? new Date(t.openTime).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {t.updateTime
                    ? new Date(t.updateTime).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/dashboard/trades/$positionId" params={{ positionId: t.positionId }}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
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
  );
}
