export const COIN_PERFORMANCE_SORTS = ["trades", "winRate"] as const;

export type CoinPerformanceSort = (typeof COIN_PERFORMANCE_SORTS)[number];

/**
 * Minimum-trades filter options. Kept as URL-friendly tokens; the numeric
 * threshold each one maps to lives in `MIN_TRADES_BY_OPTION`.
 */
export const COIN_PERFORMANCE_MIN_TRADES = ["all", "10", "20", "30"] as const;

export type CoinPerformanceMinTrades =
	(typeof COIN_PERFORMANCE_MIN_TRADES)[number];

export const MIN_TRADES_BY_OPTION: Record<CoinPerformanceMinTrades, number> = {
	all: 0,
	"10": 10,
	"20": 20,
	"30": 30,
};

export interface CoinPerformance {
	symbol: string;
	totalTrades: number;
	winRate: number;
	longTrades: number;
	longWinRate: number;
	shortTrades: number;
	shortWinRate: number;
}

export interface PaginatedCoinPerformancesResponse {
	data: CoinPerformance[];
	totalPages: number;
}
