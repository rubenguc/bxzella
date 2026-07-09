import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import {
  updateNotebookTemplate,
  deleteNotebookTemplate,
} from '#/features/notebooks-templates/repository'
import { notebookTemplateValidationSchema } from '#/features/notebooks-templates/schemas'

export const Route = createFileRoute('/api/notebook-templates/$id')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      PUT: apiHandler('PUT /api/notebook-templates/:id', async ({ request, params, context }) => {
        const { id } = params as { id: string }
        const session = (context as { session: { user: { id: string } } }).session
        const body = notebookTemplateValidationSchema.parse(await request.json())

        const updated = await updateNotebookTemplate(id, session.user.id, body)
        if (!updated) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify(updated), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),

      DELETE: apiHandler('DELETE /api/notebook-templates/:id', async ({ params, context }) => {
        const { id } = params as { id: string }
        const session = (context as { session: { user: { id: string } } }).session

        const deleted = await deleteNotebookTemplate(id, session.user.id)
        if (!deleted) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify(true), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
