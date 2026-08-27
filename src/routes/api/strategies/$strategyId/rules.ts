import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import { getStrategyRuleStats } from '#/features/strategies/repository'
import { strategyStatsSearchParamsSchema } from '#/features/strategies/schemas'

export const Route = createFileRoute('/api/strategies/$strategyId/rules')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/strategies/:strategyId/rules', async ({ request, params }) => {
        const { strategyId } = params as { strategyId: string }
        const { accountId, coin } = parseSearchParams(
          request,
          strategyStatsSearchParamsSchema,
        )

        const playbook = await getStrategyRuleStats(strategyId, accountId, coin)

        return new Response(JSON.stringify(playbook), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})