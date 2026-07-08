export interface DayProfitEntry {
  date: string
  netPnL: number
}

export interface DailyPnlTrade {
  positionId: string
  symbol: string
  positionSide: string
  leverage: number
  openTime: string
  updateTime: string
  netProfit: string
  coin: string
}

export interface DailyPnlEntry {
  date: string
  netPnL: number
  totalTrades: number
  trades: DailyPnlTrade[]
}

export interface CalendarCell {
  date: number | null
  amount: number | null
  trades: number | null
  allTrades?: DailyPnlTrade[]
  month?: number
  type?: "profit" | "loss"
}

export interface WeekSummary {
  weekNumber: number
  totalNetProfit: number
  totalTrades: number
  daysTraded: number
}

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
  dayProfits: DayProfitEntry[]
}
