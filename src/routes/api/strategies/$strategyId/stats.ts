import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import { getStrategyStats } from '#/features/strategies/repository'
import { strategyStatsSearchParamsSchema } from '#/features/strategies/schemas'

export const Route = createFileRoute('/api/strategies/$strategyId/stats')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/strategies/:strategyId/stats', async ({ request, params }) => {
        const { strategyId } = params as { strategyId: string }
        const { accountId, coin } = parseSearchParams(
          request,
          strategyStatsSearchParamsSchema,
        )

        const stats = await getStrategyStats(strategyId, accountId, coin)

        return new Response(JSON.stringify(stats), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})