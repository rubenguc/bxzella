import type { Trade } from "#/features/trades/schema";
import { m } from "#/paraglide/messages";
import { formatAmount } from "#/lib/format-amount";
import { Profit } from "#/components/Profit";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  tooltipInfo?: string;
}

function InfoRow({ label, value, valueClassName, tooltipInfo }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between text-sm lg:text-base">
      <div className="flex items-center gap-1.5 text-sm">
        <p className="text-muted-foreground">{label}</p>
        {tooltipInfo && (
          <Popover>
            <PopoverTrigger asChild>
              <Info className="text-gray-500 dark:text-gray-300" size={16} />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <p className="text-balance text-sm">{tooltipInfo}</p>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {typeof value === "string" ? (
        <p className={valueClassName || ""}>{value}</p>
      ) : (
        value
      )}
    </div>
  );
}

export function TradeInfo({ trade }: { trade: Trade }) {
  const isWin = Number(trade.netProfit) > 0;
  const isLong = trade.positionSide === "LONG";

  return (
    <div className="flex flex-col gap-2">
      {/* PnL header */}
      <div className="flex gap-2 rounded-xl py-2">
        <div
          className={`w-1 h-12 rounded-xl ${isWin ? "bg-green-500" : "bg-red-500"}`}
        />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">
            {m["trade_info.position_pnl"]()}
          </span>
          <Profit netProfit={trade.netProfit} />
        </div>
      </div>

      <InfoRow
        label={m["trade_info.realised_pnl"]()}
        tooltipInfo={m["trade_info.realised_pnl_info"]()}
        value={
          <span className={isWin ? "text-green-500" : "text-red-500"}>
            {formatAmount(Number(trade.realisedProfit), { precision: 2, suffix: trade.coin })}
          </span>
        }
      />

      <InfoRow
        label={m["trade_info.leverage"]()}
        value={`${trade.leverage}x`}
      />

      <InfoRow
        label={m["trade_info.side"]()}
        value={isLong ? m["trade_info.long"]() : m["trade_info.short"]()}
        valueClassName={isLong ? "text-green-500" : "text-red-500"}
      />

      <InfoRow
        label={m["trade_info.avg_entry_price"]()}
        value={formatAmount(trade.avgPrice, { precision: 6 })}
      />

      <InfoRow
        label={m["trade_info.avg_exit_price"]()}
        value={trade.avgClosePrice ? formatAmount(trade.avgClosePrice, { precision: 6 }) : "—"}
      />

      <InfoRow
        label={m["trade_info.isolated"]()}
        value={trade.isolated ? m["trade_info.yes"]() : m["trade_info.no"]()}
      />

      <InfoRow
        label={m["trade_info.total_funding"]()}
        tooltipInfo={m["trade_info.total_funding_info"]()}
        value={
          <span className={Number(trade.totalFunding) >= 0 ? "text-green-500" : "text-red-500"}>
            {formatAmount(Number(trade.totalFunding), { precision: 6, suffix: trade.coin })}
          </span>
        }
      />

      <InfoRow
        label={m["trade_info.position_commission"]()}
        value={
          <span className="text-red-500">
            {formatAmount(-Number(trade.positionCommission), { precision: 4, suffix: trade.coin })}
          </span>
        }
      />

      <InfoRow
        label={m["trade_info.entry_amount"]()}
        tooltipInfo={m["trade_info.entry_amount_info"]()}
        value={`${formatAmount(
          Number(trade.avgPrice) * Number(trade.positionAmt) / trade.leverage,
          { precision: 4 },
        )} ${trade.coin}`}
      />

      <p className="text-xs text-muted-foreground mt-4">
        * {m["trade_info.not_exact_values_description"]()}
      </p>
    </div>
  );
}
