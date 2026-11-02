import { sql } from "drizzle-orm";
import { db } from "#/db/index";
import type { Coin } from "#/features/exchange-providers/types";
import type {
	CoinPerformance,
	CoinPerformanceSort,
	PaginatedCoinPerformancesResponse,
} from "./types";

interface CoinPerformanceRow {
	symbol: string;
	total_trades: number;
	wins: number;
	long_trades: number;
	long_wins: number;
	short_trades: number;
	short_wins: number;
}

/**
 * Whitelisted ordering per sort option. Kept as raw fragments because the column
 * alias (`total_trades`) and the win-rate ratio are both aggregates that cannot
 * be expressed as a plain column reference.
 */
const ORDER_BY: Record<CoinPerformanceSort, ReturnType<typeof sql.raw>> = {
	trades: sql.raw("ORDER BY total_trades DESC, symbol ASC"),
	winRate: sql.raw(
		"ORDER BY (COUNT(*) FILTER (WHERE net_profit::numeric > 0))::numeric / COUNT(*) DESC, total_trades DESC, symbol ASC",
	),
};

function rate(wins: number, total: number) {
	return total > 0 ? (wins / total) * 100 : 0;
}

/**
 * Aggregated trade performance per symbol for one account and quote coin.
 * Only closed positions count, matching the rule used by strategy stats.
 * Ordered by total trades (default) or win rate, both descending.
 *
 * `minTrades` drops symbols below that trade count, in the page query and in the
 * page count alike, so pagination stays consistent with what is displayed.
 */
export async function getCoinPerformances(
	accountId: string,
	coin: Coin,
	page: number,
	limit: number,
	sortBy: CoinPerformanceSort = "trades",
	minTrades = 0,
): Promise<PaginatedCoinPerformancesResponse> {
	const offset = page * limit;
	const having = minTrades > 0 ? sql`HAVING COUNT(*) >= ${minTrades}` : sql``;

	const [rowsResult, totalResult] = await Promise.all([
		db.execute(sql`
      SELECT
        symbol,
        COUNT(*)::int AS total_trades,
        COUNT(*) FILTER (WHERE net_profit::numeric > 0)::int AS wins,
        COUNT(*) FILTER (WHERE position_side = 'LONG')::int AS long_trades,
        COUNT(*) FILTER (WHERE position_side = 'LONG' AND net_profit::numeric > 0)::int AS long_wins,
        COUNT(*) FILTER (WHERE position_side = 'SHORT')::int AS short_trades,
        COUNT(*) FILTER (WHERE position_side = 'SHORT' AND net_profit::numeric > 0)::int AS short_wins
      FROM trade
      WHERE account_id = ${accountId}
        AND coin = ${coin}
        AND close_all_positions = true
      GROUP BY symbol
      ${having}
      ${ORDER_BY[sortBy]}
      LIMIT ${limit}
      OFFSET ${offset}
    `),
		db.execute(sql`
      SELECT COUNT(*)::int AS total
      FROM (
        SELECT symbol
        FROM trade
        WHERE account_id = ${accountId}
          AND coin = ${coin}
          AND close_all_positions = true
        GROUP BY symbol
        ${having}
      ) AS filtered
    `),
	]);

	const rows = (rowsResult.rows ?? []) as unknown as CoinPerformanceRow[];
	const totalRaw = totalResult.rows?.[0] as { total?: number } | undefined;
	const total = Number(totalRaw?.total) || 0;

	const data: CoinPerformance[] = rows.map((row) => {
		const totalTrades = Number(row.total_trades) || 0;
		const longTrades = Number(row.long_trades) || 0;
		const shortTrades = Number(row.short_trades) || 0;

		return {
			symbol: row.symbol,
			totalTrades,
			winRate: rate(Number(row.wins) || 0, totalTrades),
			longTrades,
			longWinRate: rate(Number(row.long_wins) || 0, longTrades),
			shortTrades,
			shortWinRate: rate(Number(row.short_wins) || 0, shortTrades),
		};
	});

	return { data, totalPages: Math.ceil(total / limit) };
}
