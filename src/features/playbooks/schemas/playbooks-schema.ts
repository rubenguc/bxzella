import { z } from "zod";

export const playbookValidationSchema = z.object({
  name: z.string().min(1, "name_required").trim(),
  description: z.string().min(1, "description_required").trim(),
  icon: z.string().optional(),
  rulesGroup: z
    .array(
      z.object({
        name: z.string().min(1, "rule_group_name_required").trim(),
        rules: z
          .array(z.string().min(1, "rule_required").trim())
          .min(1, "at_least_one_rule_required"),
      }),
    )
    .min(1, "at_least_one_rule_group_required"),
});
