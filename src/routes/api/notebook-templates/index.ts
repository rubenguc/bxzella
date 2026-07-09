import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import { getNotebookTemplates } from '#/features/notebooks-templates/repository'
import { notebookTemplatesSearchParamsSchema } from '#/features/notebooks-templates/validation'

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
    },
  },
})
