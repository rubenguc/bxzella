import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import { getStrategiesWithStats } from '#/features/strategies/repository'
import { strategiesSearchParamsSchema } from '#/features/strategies/schemas'

export const Route = createFileRoute('/api/strategies/')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/strategies', async ({ request, context }) => {
        const session = (context as { session: { user: { id: string } } }).session
        const { accountId, coin, page, limit } = parseSearchParams(
          request,
          strategiesSearchParamsSchema,
        )

        const result = await getStrategiesWithStats(
          session.user.id,
          accountId,
          coin,
          page,
          limit,
        )

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})