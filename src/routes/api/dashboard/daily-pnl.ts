import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { parseSearchParams } from '#/lib/parse-search-params'
import {
  accountIdParamValidation,
  coinParamValidation,
} from '#/lib/zod-utils'
import { adjustDateToUTC } from '#/lib/adjust-date-to-utc'
import { getDailyPnl as getDailyPnlRepo } from '#/features/dashboard/repository'

const dailyPnlSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in yyyy-MM format'),
})

export const Route = createFileRoute('/api/dashboard/daily-pnl')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/dashboard/daily-pnl', async ({ request }) => {
        const { accountId, coin, month } = parseSearchParams(
          request,
          dailyPnlSearchParamsSchema,
        )

        const offset = Number(request.headers.get('Timezone')) || 0

        // Month range in user's timezone
        const startDate = `${month}-01`
        const [year, m] = month.split('-').map(Number)
        const lastDay = new Date(year, m, 0).getDate()
        const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

        const data = await getDailyPnlRepo({
          accountId,
          coin,
          startDate: adjustDateToUTC(startDate, offset, false),
          endDate: adjustDateToUTC(endDate, offset, true),
        })

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
