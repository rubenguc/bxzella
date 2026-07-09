import type { NotebookTemplate } from '#/features/notebooks-templates/schema'

/** Notebook template returned to the client. */
export type NotebookTemplateItem = NotebookTemplate

/** Paginated response for templates. */
export interface PaginatedTemplatesResponse {
  data: NotebookTemplateItem[]
  totalPages: number
}
