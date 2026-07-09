import { z } from 'zod'
import { limitParamValidation, pageParamValidation } from '#/lib/zod-utils'

export const notebookTemplatesSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
})

export const notebookTemplateValidationSchema = z.object({
  title: z.string().min(1, 'title_required').trim(),
  content: z.string().min(1, 'content_required').trim(),
  contentPlainText: z.string().optional(),
})
