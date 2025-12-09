import { z } from "zod";
import {
  accountIdParamValidation,
  coinParamValidation,
  limitParamValidation,
  pageParamValidation,
} from "@/utils/zod-utils";

export const dayProfitsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
});
