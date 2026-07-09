import { apiClient } from '#/lib/api-client'
import type { Notebook } from '#/features/notebooks/schema'

export async function getNotebookByTradeId(tradeId: string): Promise<Notebook | null> {
  const { data } = await apiClient.get<Notebook | null>(
    `/notebooks/trade/${tradeId}`,
  )
  return data
}

export async function upsertNotebookByTradeId(
  tradeId: string,
  body: {
    title: string
    content?: string
    contentPlainText?: string
    accountId: string
    coin: 'VST' | 'USDT' | 'USDC'
  },
): Promise<Notebook> {
  const { data } = await apiClient.post<Notebook>(
    `/notebooks/trade/${tradeId}`,
    body,
  )
  return data
}
