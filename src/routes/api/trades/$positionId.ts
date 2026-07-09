import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { authMiddleware } from "#/lib/api-middleware";
import { apiHandler } from "#/lib/api-error";
import { parseSearchParams } from "#/lib/parse-search-params";
import { getTradeByPositionId } from "#/features/trades/repository";

const tradeDetailSearchParamsSchema = z.object({
  exchangeAccountId: z.string().min(1, "exchangeAccountId is required"),
});

export const Route = createFileRoute("/api/trades/$positionId")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler("GET /api/trades/:positionId", async ({ request, params }) => {
        const { positionId } = params as { positionId: string };
        const { exchangeAccountId } = parseSearchParams(
          request,
          tradeDetailSearchParamsSchema,
        );

        const trade = await getTradeByPositionId(exchangeAccountId, positionId);
        if (!trade) {
          return new Response(JSON.stringify({ error: "Trade not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(trade), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    },
  },
});
