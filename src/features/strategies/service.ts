import { apiClient } from '#/lib/api-client'
import type { Coin } from '#/features/exchange-providers/types'
import type { Trade } from '#/features/trades/schema'
import type {
  PaginatedStrategiesResponse,
  Playbook,
  StrategyStats,
  StrategyWithPlaybook,
  TradeRuleCheckRow,
} from './types'

export async function fetchStrategies(
  accountId: string,
  coin: Coin,
  page = 0,
  limit = 20,
): Promise<PaginatedStrategiesResponse> {
  const { data } = await apiClient.get<PaginatedStrategiesResponse>('/strategies', {
    params: { accountId, coin, page, limit },
  })
  return data
}

export async function fetchStrategyStats(
  strategyId: string,
  accountId: string,
  coin: Coin,
): Promise<StrategyStats> {
  const { data } = await apiClient.get<StrategyStats>(
    `/strategies/${strategyId}/stats`,
    { params: { accountId, coin } },
  )
  return data
}

export async function fetchStrategyRuleStats(
  strategyId: string,
  accountId: string,
  coin: Coin,
): Promise<Playbook> {
  const { data } = await apiClient.get<Playbook>(
    `/strategies/${strategyId}/rules`,
    { params: { accountId, coin } },
  )
  return data
}

export async function fetchStrategyTrades(
  strategyId: string,
  accountId: string,
  coin: Coin,
  page = 0,
  limit = 20,
): Promise<{ data: Trade[]; totalPages: number }> {
  const { data } = await apiClient.get<{ data: Trade[]; totalPages: number }>(
    `/strategies/${strategyId}/trades`,
    { params: { accountId, coin, page, limit } },
  )
  return data
}

export async function fetchStrategyPlaybook(
  strategyId: string,
): Promise<StrategyWithPlaybook> {
  const { data } = await apiClient.get<StrategyWithPlaybook>(
    `/strategies/${strategyId}`,
  )
  return data
}

export async function fetchStrategyOptions(): Promise<
  { id: string; title: string }[]
> {
  const { data } = await apiClient.get<{ id: string; title: string }[]>(
    '/strategies/options',
  )
  return data
}

export async function fetchTradeRuleChecks(
  tradeId: string,
): Promise<TradeRuleCheckRow[]> {
  const { data } = await apiClient.get<TradeRuleCheckRow[]>(
    '/strategies/trade-checks',
    { params: { tradeId } },
  )
  return data
}