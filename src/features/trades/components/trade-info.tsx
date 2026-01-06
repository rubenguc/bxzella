import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";
import { Profit } from "@/components/profit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDecimal } from "@/utils/number-utils";
import {
  calculatePercentageGain,
  checkWin,
  getRealPositionAmount,
  getResultClass,
} from "@/utils/trade-utils";
import type { TradeDocument } from "../interfaces/trades-interfaces";

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
        <p className="font-medium md:text-gray-300">{label}</p>
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
        <p className={`${valueClassName || ""}`}>{value}</p>
      ) : (
        value
      )}
    </div>
  );
}

export function TradeInfo({
  trade,
}: PropsWithChildren<{ trade: TradeDocument }>) {
  const t = useTranslations("trade_info");

  const {
    _id = "",
    symbol = "",
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
    coin = "USDT",
  } = trade || {};

  const isWin = checkWin(netProfit);

  const entryAmount = formatDecimal(
    getRealPositionAmount({
      avgPrice,
      positionAmt,
      funding: totalFunding,
      comission: positionCommission,
      leverage,
    }),
    4,
  );

  const pnlRatio = calculatePercentageGain(
    Number(entryAmount),
    Number(realisedProfit),
  );
  const pnlRatioWithFee = calculatePercentageGain(
    Number(entryAmount),
    Number(netProfit),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 b rounded-xl py-2">
        <div
          className={`w-1 h-12  rounded-xl ${isWin ? "bg-green-500" : "bg-red-500"}`}
        />
        <div className="flex flex-col">
          <span className="text-sm md:text-gray-300">{t("position_pnl")}</span>
          <Profit
            className="text-xl font-bold"
            amount={Number(netProfit)}
            coin={coin}
          />
        </div>
      </div>

      <InfoRow
        label={t("realised_pnl")}
        tooltipInfo={t("realised_pnl_info")}
        value={<Profit amount={Number(realisedProfit)} coin={coin} />}
        valueClassName={isWin ? "text-green-500" : "text-red-500"}
      />

      <InfoRow label={t("leverage")} value={`${leverage}x`} />

      <InfoRow label={t("avg_entry_price")} value={`${avgPrice} ${coin}`} />

      <InfoRow label={t("avg_exit_price")} value={`${avgClosePrice} ${coin}`} />

      <InfoRow label={t("isolated")} value={isolated ? t("yes") : t("no")} />

      <InfoRow
        label={t("total_funding")}
        tooltipInfo={t("total_funding_info")}
        value={
          <Profit amount={Number(totalFunding)} decimals={6} coin={coin} />
        }
        valueClassName={getResultClass(totalFunding)}
      />

      <InfoRow
        label={t("position_commission")}
        value={
          <Profit
            amount={Number(positionCommission)}
            decimals={4}
            coin={coin}
          />
        }
        valueClassName={getResultClass(positionCommission)}
      />

      <InfoRow
        label={t("entry_amount")}
        tooltipInfo={t("entry_amount_info")}
        value={`${entryAmount} ${coin}`}
      />

      <InfoRow
        label={t("pnl_ratio")}
        value={
          <Profit amount={Number(pnlRatio)} decimals={2} coin="%" isApprox />
        }
      />

      <InfoRow
        label={t("pnl_ratio_after_fees")}
        value={
          <Profit
            amount={Number(pnlRatioWithFee)}
            decimals={2}
            coin="%"
            isApprox
          />
        }
      />

      <p className="text-sm text-gray-400 mt-4">
        * {t("not_exact_values_description")}
      </p>
    </div>
  );
}
