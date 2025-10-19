import { z } from "zod";
import {
  accountIdParamValidation,
  coinParamValidation,
  dateParamValidationOptional,
  limitParamValidation,
  pageParamValidation,
} from "@/utils/zod-utils";

export const tradesSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
  startDate: dateParamValidationOptional({ field: "startDate" }),
  endDate: dateParamValidationOptional({ field: "endDate" }),
  coin: coinParamValidation(),
});

export const openPositionsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
});
