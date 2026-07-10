import { z } from 'zod'

export const upsertNotebookSchema = z.object({
  content: z.string().optional(),
  notebookTemplateId: z.string().optional(),
  accountId: z.string().min(1, 'accountId is required'),
  coin: z.enum(['VST', 'USDT', 'USDC']),
})
