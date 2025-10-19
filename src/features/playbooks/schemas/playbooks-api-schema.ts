import { z } from "zod";
import {
  accountIdParamValidation,
  coinParamValidation,
  dateParamValidation,
  limitParamValidation,
  pageParamValidation,
} from "@/utils/zod-utils";

export const playbooksSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate" }),
  coin: coinParamValidation(),
});

export const playbooksAllSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
  accountId: accountIdParamValidation(),
});

export const playbookParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate" }),
  coin: coinParamValidation(),
});

export const playbookRulesCompletionParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate" }),
  coin: coinParamValidation(),
});

export const playbookTradesParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate" }),
  coin: coinParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
});
