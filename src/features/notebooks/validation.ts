import { z } from 'zod'
import { coinSchema } from '#/lib/zod-utils'

export const upsertNotebookSchema = z.object({
  content: z.string().optional(),
  notebookTemplateId: z.string().optional(),
  accountId: z.string().min(1, 'accountId is required'),
  coin: coinSchema,
})
