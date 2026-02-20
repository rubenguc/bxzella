import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { Coin } from "@/interfaces/global-interfaces";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";

interface ProfitProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> {
  amount: number;
  coin?: Coin | string;
  decimals?: number;
  showSign?: boolean;
  isApprox?: boolean;
  prefix?: string;
  postfix?: string;
}

export function Profit({
  amount = 0,
  coin = "",
  decimals = 2,
  className = "",
  showSign = true,
  isApprox = false,
  prefix = "",
  postfix = "",
  ...props
}: ProfitProps) {
  const colorText = getResultClass(amount);
  const formattedAmount = `${isApprox ? "≈" : ""} ${prefix} ${formatDecimal(amount, decimals, showSign)} ${coin} ${postfix}`;

  return (
    <span {...props} className={`${colorText} ${className}`}>
      {formattedAmount}
    </span>
  );
}
