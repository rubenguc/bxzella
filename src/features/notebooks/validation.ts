import { z } from 'zod'

export const upsertNotebookSchema = z.object({
  title: z.string().min(1, 'title_required').trim(),
  content: z.string().optional(),
  notebookTemplateId: z.string().optional(),
  accountId: z.string().min(1, 'accountId is required'),
  coin: z.enum(['VST', 'USDT', 'USDC']),
})
