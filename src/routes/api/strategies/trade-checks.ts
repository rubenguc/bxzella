import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import { getTradeRuleChecksByTradeId } from '#/features/strategies/repository'
import { tradeChecksSearchParamsSchema } from '#/features/strategies/schemas'

export const Route = createFileRoute('/api/strategies/trade-checks')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/strategies/trade-checks', async ({ request }) => {
        const { tradeId } = parseSearchParams(request, tradeChecksSearchParamsSchema)
        const checks = await getTradeRuleChecksByTradeId(tradeId)

        return new Response(JSON.stringify(checks), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})