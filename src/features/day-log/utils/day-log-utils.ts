import type { DayLog } from "@/features/day-log/interfaces/day-log-interfaces";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { formatDecimal } from "@/utils/number-utils";

export function calculateDayLogValues(
  trades: TradeDocument[],
): Pick<
  DayLog,
  | "totalTrades"
  | "winRate"
  | "winners"
  | "lossers"
  | "commissions"
  | "profitFactor"
  | "netPnL"
  | "trades"
> {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      winners: 0,
      lossers: 0,
      commissions: 0,
      profitFactor: 0,
      netPnL: 0,
      trades: [],
    };
  }

  let totalNetPnL = 0;
  let totalCommissions = 0;
  let winners = 0;
  let lossers = 0;
  let totalWin = 0;
  let totalLoss = 0;

  trades.forEach((trade: TradeDocument) => {
    const netProfit = parseFloat(trade.netProfit) || 0;
    const commission = parseFloat(trade.positionCommission) || 0;

    totalNetPnL += netProfit;
    totalCommissions += commission;

    if (netProfit > 0) {
      winners++;
      totalWin += netProfit;
    } else if (netProfit < 0) {
      lossers++;
      totalLoss += netProfit;
    }
  });

  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winners / totalTrades) * 100 : 0;

  const profitFactor =
    totalLoss !== 0 ? totalWin / Math.abs(totalLoss) : totalWin;

  return {
    trades,
    totalTrades,
    winRate: Number(formatDecimal(winRate, 2)),
    winners,
    lossers,
    commissions: totalCommissions,
    profitFactor: profitFactor,
    netPnL: totalNetPnL,
  };
}
