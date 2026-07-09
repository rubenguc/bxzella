import { apiClient } from '#/lib/api-client'
import type { NotebookTemplate } from '#/features/notebooks-templates/schema'
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

export async function createNotebookTemplate(body: {
  title: string
  content: string
  contentPlainText?: string
}): Promise<NotebookTemplate> {
  const { data } = await apiClient.post<NotebookTemplate>(
    '/notebook-templates',
    body,
  )
  return data
}

export async function updateNotebookTemplate(
  id: string,
  body: {
    title?: string
    content?: string
    contentPlainText?: string
  },
): Promise<NotebookTemplate> {
  const { data } = await apiClient.put<NotebookTemplate>(
    `/notebook-templates/${id}`,
    body,
  )
  return data
}

export async function deleteNotebookTemplate(
  id: string,
): Promise<boolean> {
  const { data } = await apiClient.delete<boolean>(
    `/notebook-templates/${id}`,
  )
  return data
}
