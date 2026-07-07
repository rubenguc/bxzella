export interface DashboardStats {
  netPnL: {
    value: number
    totalTrades: number
  }
  profitFactor: {
    value: number
    sumWin: number
    sumLoss: number
  }
  tradeWin: {
    value: number
    totalWin: number
    totalLoss: number
  }
  avgWinLoss: {
    value: number
    avgWin: number
    avgLoss: number
  }
}
