import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import {
  accountIdParamValidation,
  coinParamValidation,
  dateParamValidation,
} from '#/lib/zod-utils'
import { getDashboardStats } from '#/features/dashboard/repository'

const dashboardSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: 'startDate' }),
  endDate: dateParamValidation({ field: 'endDate' }),
  coin: coinParamValidation(),
})

export const Route = createFileRoute('/api/dashboard')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/dashboard', async ({ request }) => {
        const { accountId, startDate, endDate, coin } = parseSearchParams(
          request,
          dashboardSearchParamsSchema,
        )

        const data = await getDashboardStats({
          accountId,
          startDate,
          endDate,
          coin,
        })

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
