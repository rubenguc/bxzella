import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import {
  accountIdParamValidation,
  coinParamValidation,
} from '#/lib/zod-utils'
import { getRecentTrades } from '#/features/trades/repository'

const recentTradesSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
})

export const Route = createFileRoute('/api/dashboard/recent-trades')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/dashboard/recent-trades', async ({ request }) => {
        const { accountId, coin } = parseSearchParams(
          request,
          recentTradesSearchParamsSchema,
        )

        const trades = await getRecentTrades(accountId, coin)

        return new Response(JSON.stringify(trades), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
