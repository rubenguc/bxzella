import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import {
  getNotebookTemplates,
  createNotebookTemplate,
} from '#/features/notebooks-templates/repository'
import {
  notebookTemplatesSearchParamsSchema,
  notebookTemplateValidationSchema,
} from '#/features/notebooks-templates/schemas'

export const Route = createFileRoute('/api/notebook-templates/')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/notebook-templates', async ({ request, context }) => {
        const session = (context as { session: { user: { id: string } } }).session
        const { page, limit } = parseSearchParams(
          request,
          notebookTemplatesSearchParamsSchema,
        )

        const result = await getNotebookTemplates(session.user.id, page, limit)

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),

      POST: apiHandler('POST /api/notebook-templates', async ({ request, context }) => {
        const session = (context as { session: { user: { id: string } } }).session
        const body = notebookTemplateValidationSchema.parse(await request.json())

        const created = await createNotebookTemplate({
          ...body,
          contentPlainText: body.contentPlainText ?? '',
          userId: session.user.id,
        })

        return new Response(JSON.stringify(created), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
