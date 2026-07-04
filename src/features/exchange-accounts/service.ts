import axios from 'axios'
import type { AccountItem } from '#/features/exchange-accounts/types'

/** GET wrapper — fetches accounts for the current user. */
export async function fetchAccounts(): Promise<AccountItem[]> {
  const { data } = await axios.get<AccountItem[]>('/api/accounts')
  return data
}
