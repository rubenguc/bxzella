import { z } from "zod";
import {
  accountIdParamValidation,
  coinParamValidation,
  dateParamValidation,
  limitParamValidation,
  pageParamValidation,
} from "@/utils/zod-utils";

export const tradesSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate", tillEndOfTheDay: true }),
  coin: coinParamValidation(),
});

export const openPositionsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
});
