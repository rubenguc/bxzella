import type { DayProfitEntry } from '#/features/dashboard/types'

export interface StrategyWithStats {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  totalTrades: number
  netPnL: number
  winRate: number
}

export interface PaginatedStrategiesResponse {
  data: StrategyWithStats[]
  totalPages: number
}

/** Same shape as DashboardStats — used for the strategy detail header. */
export interface StrategyStats {
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

export interface RuleStats {
  ruleId: string
  title: string
  position: number
  followRate: number
  netPnL: number
  profitFactor: number
  winRate: number
  followedTrades: number
}

export interface RuleGroupStats {
  ruleGroupId: string
  title: string
  position: number
  rules: RuleStats[]
}

export interface Playbook {
  totalTrades: number
  groups: RuleGroupStats[]
}

export interface StrategyPlaybookRule {
  id: string
  title: string
  position: number
}

export interface StrategyPlaybookGroup {
  id: string
  title: string
  position: number
  rules: StrategyPlaybookRule[]
}

export interface StrategyWithPlaybook {
  id: string
  title: string
  description: string | null
  ruleGroups: StrategyPlaybookGroup[]
}

export interface TradeRuleCheckRow {
  ruleId: string
  followed: boolean
}

export type StrategiesDialogType = 'create' | 'edit' | 'delete'