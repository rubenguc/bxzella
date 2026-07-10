import { useState, useCallback } from 'react'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
}

interface UsePaginationOptions<T> {
  /** Base query key (page is appended automatically). */
  queryKey: readonly unknown[]
  /** Fetch function receiving (page, limit). */
  queryFn: (page: number, limit: number) => Promise<PaginatedResponse<T>>
  /** Rows per page. */
  limit?: number
  /** Whether the query is enabled. */
  enabled?: boolean
  /** Additional react-query options. */
  queryOptions?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
}

export function usePagination<T>({
  queryKey,
  queryFn,
  limit = 20,
  enabled = true,
  queryOptions,
}: UsePaginationOptions<T>) {
  const [page, setPage] = useState(0)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
    enabled,
    placeholderData: (prev) => prev,
    ...queryOptions,
  })

  const items = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const hasNext = page < totalPages - 1
  const hasPrev = page > 0

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, Math.max(totalPages - 1, 0)))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0))
  }, [])

  const goToPage = useCallback(
    (p: number) => {
      setPage(Math.max(0, Math.min(p, Math.max(totalPages - 1, 0))))
    },
    [totalPages],
  )

  const firstPage = useCallback(() => setPage(0), [])
  const lastPage = useCallback(() => setPage(Math.max(totalPages - 1, 0)), [totalPages])

  return {
    items,
    page,
    totalPages,
    isLoading,
    isFetching,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    firstPage,
    lastPage,
    refetch,
  }
}
