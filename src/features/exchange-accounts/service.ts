import { apiClient } from '#/lib/api-client'
import type { AccountItem } from '#/features/exchange-accounts/types'

/** GET wrapper — fetches accounts for the current user. */
export async function fetchAccounts(): Promise<AccountItem[]> {
  const { data } = await apiClient.get<AccountItem[]>('/accounts')
  return data
}
