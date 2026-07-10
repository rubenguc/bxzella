import { apiClient } from '#/lib/api-client'
import type { PaginatedTemplatesResponse } from '#/features/notebooks-templates/types'

export async function getNotebookTemplates(
  page = 0,
  limit = 20,
): Promise<PaginatedTemplatesResponse> {
  const { data } = await apiClient.get<PaginatedTemplatesResponse>(
    '/notebook-templates',
    { params: { page, limit } },
  )
  return data
}
