"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTradeContext } from "@/features/trades/context/trades-context";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { formatDecimal } from "@/utils/number-utils";
import {
  calculatePercentageGain,
  checkLongPosition,
  checkWin,
  getRealPositionAmount,
  getResultClass,
  transformSymbol,
} from "@/utils/trade-utils";
import { TradeNotebook } from "./trade-notebook";
import { TradePlaybook } from "./trades-playbook";

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
      <p className={valueClassName}>{value}</p>
    </div>
  );
}

export function TradeInfoDialog() {
  const t = useTranslations("trade_info");
  const { isOpen, currentTrade, setCurrentTrade } = useTradeContext();

  const {
    _id = "",
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
    coin = "USDT",
    playbook = {
      id: "",
      totalRules: 0,
      totalCompletedRules: 0,
      rulesProgress: [],
    },
  } = currentTrade || {};

  const isWin = checkWin(netProfit);
  const isLongPosition = checkLongPosition(positionSide);
  const formattedSymbol = transformSymbol(symbol);

  const netProfitFormatted = Number(netProfit);
  const realisedProfitFormatted = Number(realisedProfit);
  const avgPriceFormatted = avgPrice;
  const avgClosePriceFormatted = avgClosePrice;
  const totalFundingFormatted = formatDecimal(Number(totalFunding), 4);
  const positionCommissionFormatted = formatDecimal(
    Number(positionCommission),
    4,
  );

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
    Number(netProfitFormatted),
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => setCurrentTrade(null)}>
      <DialogContent
        className="w-full sm:max-w-4/5"
        aria-describedby={undefined}
      >
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
        <div className="flex flex-col md:flex-row gap-5">
          <div className="md:w-2/5">
            <div className="min-h-[26.25rem]  overflow-y-auto py-1 w-full">
              <Tabs className="h-full" defaultValue="info">
                <TabsList>
                  <TabsTrigger
                    value="info"
                    className="dark:data-[state=active]:bg-accent dark:data-[state=active]:border-none"
                  >
                    {t("info")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="playbooks"
                    className="dark:data-[state=active]:bg-accent dark:data-[state=active]:border-none"
                  >
                    {t("playbooks")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="info"
                  className="border rounded-xl py-2 px-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 b rounded-xl py-2">
                      <div
                        className={`w-1 h-12  rounded-xl ${isWin ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-gray-300">
                          {t("position_pnl")}
                        </span>
                        <strong
                          className={`${isWin ? "text-green-500" : "text-red-500"} text-xl`}
                        >{`${netProfitFormatted} ${coin}`}</strong>
                      </div>
                    </div>

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
                      label={t("entry_amount")}
                      tooltipInfo={t("entry_amount_info")}
                      value={`${entryAmount} ${coin}`}
                    />

                    <InfoRow
                      label={t("pnl_ratio")}
                      value={`≈ ${pnlRatio} %`}
                      valueClassName={getResultClass(pnlRatio)}
                    />

                    <InfoRow
                      label={t("pnl_ratio_after_fees")}
                      value={`≈ ${pnlRatioWithFee} %`}
                      valueClassName={getResultClass(pnlRatioWithFee)}
                    />

                    <p className="text-sm text-gray-400 mt-4">
                      * {t("not_exact_values_description")}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent
                  value="playbooks"
                  className="flex flex-col flex-1 border border-muted rounded-xl py-2 px-4"
                >
                  <TradePlaybook tradePlaybook={playbook} tradeId={_id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="md:w-3/5 flex flex-col p-2 relative">
            <TradeNotebook tradeId={_id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
