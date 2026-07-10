import { z } from 'zod'
import { PROVIDERS } from '#/features/exchange-providers/types'

export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  secretKey: z.string().min(1, 'Secret key is required'),
  provider: z.enum(PROVIDERS),
})

export const accountUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

/** Edit-only — matches form defaults when only `name` is editable. */
export const accountEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
  provider: z.enum(PROVIDERS).optional(),
})

export type AccountForm = z.infer<typeof accountSchema>
export type AccountEditForm = z.infer<typeof accountEditSchema>
