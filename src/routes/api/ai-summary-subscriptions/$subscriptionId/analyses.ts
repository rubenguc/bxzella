import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { getAnalysesBySubscriptionId } from '#/features/ai-summary-analyses/repository'

export const Route = createFileRoute(
  '/api/ai-summary-subscriptions/$subscriptionId/analyses',
)({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler(
        'GET /api/ai-summary-subscriptions/:subscriptionId/analyses',
        async ({ request, params }) => {
          const { subscriptionId } = params as { subscriptionId: string }
          const url = new URL(request.url)
          const limit = Number(url.searchParams.get('limit')) || 20
          const offset = Number(url.searchParams.get('offset')) || 0

          const result = await getAnalysesBySubscriptionId(subscriptionId, {
            limit,
            offset,
          })

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        },
      ),
    },
  },
})
