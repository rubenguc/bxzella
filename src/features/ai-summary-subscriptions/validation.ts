import { z } from 'zod'

export const createSubscriptionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  coin: z.enum(['VST', 'USDT', 'USDC']),
  includeNotebook: z.boolean().optional().default(true),
})

export type CreateSubscriptionForm = z.infer<typeof createSubscriptionSchema>
