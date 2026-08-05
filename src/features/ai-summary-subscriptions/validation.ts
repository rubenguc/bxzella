import { z } from 'zod'
import { coinSchema } from '#/lib/zod-utils'

export const createSubscriptionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  coin: coinSchema,
  includeNotebook: z.boolean().optional().default(true),
})

export type CreateSubscriptionForm = z.infer<typeof createSubscriptionSchema>
