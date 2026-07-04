import { useQuery } from '@tanstack/react-query'
import { fetchAccounts } from '#/features/exchange-accounts/service'

export function useGetAccounts() {
  return useQuery({
    queryKey: ['exchange-accounts'],
    queryFn: fetchAccounts,
  })
}
