import { z } from 'zod'
import {
  accountIdParamValidation,
  coinParamValidation,
  limitParamValidation,
  pageParamValidation,
} from '#/lib/zod-utils'

export const strategiesSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
})

export const strategyStatsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
})

export const tradeChecksSearchParamsSchema = z.object({
  tradeId: z.string().min(1),
})

export type StrategiesSearchParams = z.infer<typeof strategiesSearchParamsSchema>
export type StrategyStatsSearchParams = z.infer<typeof strategyStatsSearchParamsSchema>