import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import { syncPositions } from '#/features/trades/repository'
import {
  accountIdParamValidation,
  coinParamValidation,
} from '#/lib/zod-utils'
import { z } from 'zod'

const syncSearchParamsSchema = z.object({
  exchangeAccountId: accountIdParamValidation(),
  coin: coinParamValidation(),
})

export const Route = createFileRoute('/api/trades/sync')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/trades/sync', async ({ request }) => {
        const { exchangeAccountId, coin } = parseSearchParams(
          request,
          syncSearchParamsSchema,
        )

        const result = await syncPositions(exchangeAccountId, coin)

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
