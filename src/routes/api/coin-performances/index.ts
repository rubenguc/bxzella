import { createFileRoute } from "@tanstack/react-router";
import { getCoinPerformances } from "#/features/coin-performances/repository";
import { coinPerformancesSearchParamsSchema } from "#/features/coin-performances/schemas";
import { MIN_TRADES_BY_OPTION } from "#/features/coin-performances/types";
import { apiHandler } from "#/lib/api-error";
import { authMiddleware } from "#/lib/api-middleware";
import { parseSearchParams } from "#/lib/parse-search-params";

export const Route = createFileRoute("/api/coin-performances/")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: apiHandler("GET /api/coin-performances", async ({ request }) => {
				const { exchangeAccountId, coin, page, limit, sortBy, minTrades } =
					parseSearchParams(request, coinPerformancesSearchParamsSchema);

				const { data, totalPages } = await getCoinPerformances(
					exchangeAccountId,
					coin,
					page,
					limit,
					sortBy,
					MIN_TRADES_BY_OPTION[minTrades],
				);

				return new Response(JSON.stringify({ data, totalPages }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}),
		},
	},
});
