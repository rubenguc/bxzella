import { createFileRoute } from "@tanstack/react-router";
import { getTradesPaginated } from "#/features/trades/repository";
import { tradesSearchParamsSchema } from "#/features/trades/schemas";
import { apiHandler } from "#/lib/api-error";
import { authMiddleware } from "#/lib/api-middleware";
import { parseSearchParams } from "#/lib/parse-search-params";

export const Route = createFileRoute("/api/trades/")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler("GET /api/trades", async ({ request }) => {
        const { exchangeAccountId, coin, page, limit } = parseSearchParams(
          request,
          tradesSearchParamsSchema,
        );

        const { data, totalPages } = await getTradesPaginated(
          exchangeAccountId,
          page,
          limit,
          coin,
        );

        return new Response(
          JSON.stringify({ data, totalPages }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }),
    },
  },
});
