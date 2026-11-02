import type {
	CoinPerformanceMinTrades,
	CoinPerformanceSort,
	PaginatedCoinPerformancesResponse,
} from "#/features/coin-performances/types";
import type { Coin } from "#/features/exchange-providers/types";
import { apiClient } from "#/lib/api-client";

export async function fetchCoinPerformances(
	accountId: string,
	coin: Coin,
	page = 0,
	limit = 20,
	sortBy: CoinPerformanceSort = "trades",
	minTrades: CoinPerformanceMinTrades = "all",
): Promise<PaginatedCoinPerformancesResponse> {
	const { data } = await apiClient.get<PaginatedCoinPerformancesResponse>(
		"/coin-performances",
		{
			params: {
				exchangeAccountId: accountId,
				coin,
				page,
				limit,
				sortBy,
				minTrades,
			},
		},
	);
	return data;
}
