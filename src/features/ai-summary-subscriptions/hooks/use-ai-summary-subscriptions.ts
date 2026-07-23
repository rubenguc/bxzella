import { useQuery } from '@tanstack/react-query'
import { fetchSubscriptions } from '#/features/ai-summary-subscriptions/service'

export function useGetSubscriptions() {
  return useQuery({
    queryKey: ['ai-summary-subscriptions'],
    queryFn: fetchSubscriptions,
  })
}
