import { apiClient } from '#/lib/api-client'
import type { Notebook } from '#/features/notebooks/schema'

export async function getNotebookByTradeId(tradeId: string): Promise<Notebook | null> {
  const { data } = await apiClient.get<Notebook | null>(
    `/notebooks/trade/${tradeId}`,
  )
  return data
}
