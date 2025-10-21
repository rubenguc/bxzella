import { z } from "zod";
import {
  accountIdParamValidation,
  coinParamValidation,
  dateParamValidation,
} from "@/utils/zod-utils";

export const statictisSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate" }),
  coin: coinParamValidation(),
});

export const dayProfitsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, { message: "Month must be in format yyyy-MM" })
    .optional(),
});
