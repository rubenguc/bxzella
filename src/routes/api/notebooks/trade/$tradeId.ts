import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { getNotebookByTradeId } from '#/features/notebooks/repository'

export const Route = createFileRoute('/api/notebooks/trade/$tradeId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/notebooks/trade/:tradeId', async ({ params }) => {
        const { tradeId } = params as { tradeId: string }

        const notebook = await getNotebookByTradeId(tradeId)
        return new Response(JSON.stringify(notebook), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
