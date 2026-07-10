import { z } from 'zod'
import {
  accountIdParamValidation,
  coinParamValidation,
  limitParamValidation,
  pageParamValidation,
} from '#/lib/zod-utils'

export const tradesSearchParamsSchema = z.object({
  exchangeAccountId: accountIdParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
  coin: coinParamValidation(),
})

export type TradesSearchParams = z.infer<typeof tradesSearchParamsSchema>
