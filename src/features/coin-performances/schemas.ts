import { z } from "zod";
import {
	COIN_PERFORMANCE_MIN_TRADES,
	COIN_PERFORMANCE_SORTS,
} from "#/features/coin-performances/types";
import {
	accountIdParamValidation,
	coinParamValidation,
	limitParamValidation,
	pageParamValidation,
} from "#/lib/zod-utils";

export const coinPerformancesSearchParamsSchema = z.object({
	exchangeAccountId: accountIdParamValidation(),
	page: pageParamValidation(),
	limit: limitParamValidation(),
	coin: coinParamValidation(),
	sortBy: z.enum(COIN_PERFORMANCE_SORTS).default("trades"),
	minTrades: z.enum(COIN_PERFORMANCE_MIN_TRADES).default("all"),
});

export type CoinPerformancesSearchParams = z.infer<
	typeof coinPerformancesSearchParamsSchema
>;
