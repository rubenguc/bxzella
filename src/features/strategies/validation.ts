import { z } from 'zod'

export const strategyFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v ? v.trim() : null)),
  ruleGroups: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().trim().min(1, 'Rule group title is required').max(120),
      rules: z.array(
        z.object({
          id: z.string().optional(),
          title: z.string().trim().min(1, 'Rule title is required').max(120),
        }),
      ),
    }),
  ),
})

export type StrategyForm = z.infer<typeof strategyFormSchema>

export const setTradeStrategySchema = z.object({
  tradeId: z.string().min(1),
  strategyId: z.string().min(1).nullable(),
  checks: z.array(
    z.object({
      ruleId: z.string().min(1),
      followed: z.boolean(),
    }),
  ),
})

export type SetTradeStrategyInput = z.infer<typeof setTradeStrategySchema>