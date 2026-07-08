import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import {
  accountIdParamValidation,
  coinParamValidation,
} from '#/lib/zod-utils'
import { getAccountById } from '#/features/exchange-accounts/repository'
import { getProviderFromAccount } from '#/features/exchange-providers/get-provider'

const openPositionsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
})

export const Route = createFileRoute('/api/dashboard/open-positions')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/dashboard/open-positions', async ({ request }) => {
        const { accountId, coin } = parseSearchParams(
          request,
          openPositionsSearchParamsSchema,
        )

        const account = await getAccountById(accountId)
        if (!account) {
          return new Response(JSON.stringify({ error: 'Account not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const provider = getProviderFromAccount(account)
        const positions = await provider.getOpenPositions(coin)

        return new Response(JSON.stringify(positions), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
