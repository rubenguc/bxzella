"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ITradeModel } from "../model/trades";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { useTradeContext } from "../context/trades-context";
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
  } = currentTrade || ({} as ITradeModel);

  const isWin = checkWin(netProfit);
  const isLongPosition = checkLongPosition(positionSide);
  const formattedSymbol = transformSymbol(symbol);

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
          <div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
            <div className="flex flex-col gap-2">
              {/* net pnl */}
              <div
                className={`flex items-center justify-between text-xl ${isWin ? "text-green-500" : "text-red-500"}`}
              >
                <p className="font-bold">{t("position_pnl")}</p>
                <p className="font-bold">
                  {" "}
                  {formatDecimal(Number(netProfit))} {coin}
                </p>
              </div>

              {/* realised_pnl pnl */}
              <div
                className={`flex items-center justify-between ${isWin ? "text-green-500" : "text-red-500"}`}
              >
                <p>{t("realised_pnl")}</p>
                <p>
                  {" "}
                  {formatDecimal(Number(realisedProfit))} {coin}
                </p>
              </div>

              {/* leverage */}
              <div className="flex items-center justify-between">
                <p>{t("leverage")}</p>
                <p>{leverage}x</p>
              </div>

              {/* entry price */}
              <div className="flex items-center justify-between">
                <p className="">{t("avg_entry_price")}</p>
                <p className="">
                  {formatDecimal(Number(avgPrice))} {coin}
                </p>
              </div>

              {/* exit price */}
              <div className="flex items-center justify-between">
                <p className="">{t("avg_exit_price")}</p>
                <p className="">
                  {formatDecimal(Number(avgClosePrice))} {coin}
                </p>
              </div>

              {/* isolated */}
              <div className="flex items-center justify-between">
                <p className="">{t("isolated")}</p>
                <p>{isolated ? t("yes") : t("no")}</p>
              </div>

              {/* total funding */}
              <div className="flex items-center justify-between">
                <p className="">{t("total_funding")}</p>
                <p className={getResultClass(totalFunding)}>
                  {formatDecimal(Number(totalFunding), 4)} {coin}
                </p>
              </div>

              {/* position commission */}
              <div className="flex items-center justify-between">
                <p className="">{t("position_commission")}</p>
                <p className={getResultClass(positionCommission)}>
                  {formatDecimal(Number(positionCommission), 4)} {coin}
                </p>
              </div>

              {/* aprox_entry_amount */}
              <div className="flex items-center justify-between">
                <p className="">{t("aprox_entry_amount")}</p>
                <p>
                  ≈{" "}
                  {formatDecimal(
                    getRealPositionAmount({
                      avgPrice,
                      positionAmt,
                    }) / leverage,
                    2,
                  )}{" "}
                  {coin}
                </p>
              </div>

              {/* Open Position value */}
              <div className="flex items-center justify-between">
                <p className="">
                  {t("open_position_value")} ({leverage}x)
                </p>
                <p>
                  ≈{" "}
                  {formatDecimal(
                    getRealPositionAmount({
                      avgPrice,
                      positionAmt,
                    }),
                    2,
                  )}{" "}
                  {coin}
                </p>
              </div>

              {/* Closed Position value */}
              <div className="flex items-center justify-between">
                <p className="">
                  {t("close_position_value")} ({leverage}x)
                </p>
                <p>
                  ≈{" "}
                  {formatDecimal(
                    getRealPositionAmount({
                      avgPrice: avgClosePrice,
                      positionAmt,
                    }),
                    2,
                  )}{" "}
                  {coin}
                </p>
              </div>

              {/* Open Position amount */}
              <div className="flex items-center justify-between">
                <p className="">
                  {t("open_position_amount")} ({leverage}x)
                </p>
                <p>
                  ≈ {formatSymbolAmount(positionAmt)} {formattedSymbol}
                </p>
              </div>

              {/* Open Position amount */}
              <div className="flex items-center justify-between">
                <p className="">
                  {t("close_position_amount")} ({leverage}x)
                </p>
                <p>
                  ≈ {formatSymbolAmount(closePositionAmt)} {formattedSymbol}
                </p>
              </div>
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
