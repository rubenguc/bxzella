"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { useTradeContext } from "@/features/trades/context/trades-context";
import {
  checkLongPosition,
  checkWin,
  formatSymbolAmount,
  getRealPositionAmount,
  getResultClass,
  transformSymbol,
} from "@/utils/trade-utils";
import { useTranslations } from "next-intl";
import { formatDecimal } from "@/utils/number-utils";
import { useUserConfigStore } from "@/store/user-config-store";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
  tooltipInfo?: string;
}

export function InfoRow({
  label,
  value,
  className,
  valueClassName,
  tooltipInfo,
}: InfoRowProps) {
  return (
    <div
      className={`flex items-center justify-between text-sm lg:text-base ${className || ""}`}
    >
      <div className="flex items-center gap-1.5">
        <p className="font-medium">{label}</p>
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
      <p className={valueClassName}>{value}</p>
    </div>
  );
}

export function TradeInfoDialog() {
  const t = useTranslations("trade_info");
  const { isOpen, currentTrade, setCurrentTrade } = useTradeContext();
  const coin = useUserConfigStore((state) => state.coin);

  const {
    symbol = "",
    openTime = "",
    updateTime = "",
    netProfit = "0",
    leverage = 0,
    avgPrice = "",
    avgClosePrice = "",
    realisedProfit = "",
    isolated = true,
    totalFunding = "",
    positionCommission = "",
    positionSide = "0",
    positionAmt = "0",
    closePositionAmt = "",
  } = currentTrade || {};

  const isWin = checkWin(netProfit);
  const isLongPosition = checkLongPosition(positionSide);
  const formattedSymbol = transformSymbol(symbol);

  const netProfitFormatted = formatDecimal(Number(netProfit));
  const realisedProfitFormatted = formatDecimal(Number(realisedProfit));
  const avgPriceFormatted = formatDecimal(Number(avgPrice));
  const avgClosePriceFormatted = formatDecimal(Number(avgClosePrice));
  const totalFundingFormatted = formatDecimal(Number(totalFunding), 4);
  const positionCommissionFormatted = formatDecimal(
    Number(positionCommission),
    4,
  );

  const aproxEntryAmount = formatDecimal(
    getRealPositionAmount({ avgPrice, positionAmt }),
  );
  const aproxEntryAmountWithLeverage = formatDecimal(
    Number(aproxEntryAmount) / leverage,
    2,
  );
  const openPositionValue = formatDecimal(
    getRealPositionAmount({ avgPrice, positionAmt }),
  );
  const closePositionValue = formatDecimal(
    getRealPositionAmount({
      avgPrice: avgClosePrice,
      positionAmt,
    }),
  );
  const openPositionAmountFormatted = formatSymbolAmount(positionAmt);
  const closePositionAmountFormatted = formatSymbolAmount(closePositionAmt);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => setCurrentTrade(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-5 text-2xl">
              {formattedSymbol}
              <Badge variant={isLongPosition ? "green-filled" : "red-filled"}>
                {positionSide}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {transformTimeToLocalDate(openTime)} -{" "}
              {transformTimeToLocalDate(updateTime)}
            </DialogDescription>
          </DialogHeader>
          <div className="-mr-4 min-h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
            <div className="flex flex-col gap-2">
              <InfoRow
                label={t("position_pnl")}
                tooltipInfo={t("position_pnl_info")}
                value={`${netProfitFormatted} ${coin}`}
                valueClassName={`font-bold ${isWin ? "text-green-500" : "text-red-500"}`}
                className="text-xl"
              />

              <InfoRow
                label={t("realised_pnl")}
                tooltipInfo={t("realised_pnl_info")}
                value={`${realisedProfitFormatted} ${coin}`}
                valueClassName={isWin ? "text-green-500" : "text-red-500"}
              />

              <InfoRow label={t("leverage")} value={`${leverage}x`} />

              <InfoRow
                label={t("avg_entry_price")}
                value={`${avgPriceFormatted} ${coin}`}
              />

              <InfoRow
                label={t("avg_exit_price")}
                value={`${avgClosePriceFormatted} ${coin}`}
              />

              <InfoRow
                label={t("isolated")}
                value={isolated ? t("yes") : t("no")}
              />

              <InfoRow
                label={t("total_funding")}
                tooltipInfo={t("total_funding_info")}
                value={`${totalFundingFormatted} ${coin}`}
                valueClassName={getResultClass(totalFunding)}
              />

              <InfoRow
                label={t("position_commission")}
                value={`${positionCommissionFormatted} ${coin}`}
                valueClassName={getResultClass(positionCommission)}
              />

              <InfoRow
                label={t("approx_entry_amount")}
                tooltipInfo={t("approx_entry_amount_info")}
                value={`≈ ${aproxEntryAmountWithLeverage} ${coin}`}
              />

              <InfoRow
                label={`${t("open_position_value")} (${leverage}x)`}
                value={`≈ ${openPositionValue} ${coin}`}
              />

              <InfoRow
                label={`${t("close_position_value")} (${leverage}x)`}
                value={`≈ ${closePositionValue} ${coin}`}
              />

              <InfoRow
                label={`${t("open_position_amount")} (${leverage}x)`}
                value={`≈ ${openPositionAmountFormatted} ${formattedSymbol}`}
              />

              <InfoRow
                label={`${t("close_position_amount")} (${leverage}x)`}
                value={`≈ ${closePositionAmountFormatted} ${formattedSymbol}`}
              />

              <p className="text-sm text-gray-400 mt-4">
                * {t("not_exact_values_description")}
              </p>
            </div>
          </div>
          {/* <DialogFooter>
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              form="user-form"
            >
              {t("save_changes")}
            </Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
