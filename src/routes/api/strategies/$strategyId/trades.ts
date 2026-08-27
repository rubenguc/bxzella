import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import { getStrategyTradesPaginated } from '#/features/strategies/repository'
import { strategiesSearchParamsSchema } from '#/features/strategies/schemas'

export const Route = createFileRoute('/api/strategies/$strategyId/trades')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/strategies/:strategyId/trades', async ({ request, params }) => {
        const { strategyId } = params as { strategyId: string }
        const { accountId, coin, page, limit } = parseSearchParams(
          request,
          strategiesSearchParamsSchema,
        )

        const result = await getStrategyTradesPaginated(
          strategyId,
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