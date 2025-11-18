import { z } from "zod";
import { limitParamValidation, pageParamValidation } from "@/utils/zod-utils";

export const notebooksTemplateSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
});

export const notebooksTemplateValidationSchema = z.object({
  title: z.string().min(1, "title_required").trim(),
  content: z.string().min(1, "content_required").trim(),
});

export type NotebooksTemplateForm = z.infer<
  typeof notebooksTemplateValidationSchema
>;
