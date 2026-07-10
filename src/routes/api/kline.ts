import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { authMiddleware } from "#/lib/api-middleware";
import { apiHandler } from "#/lib/api-error";
import { parseSearchParams } from "#/lib/parse-search-params";
import { getAccountById } from "#/features/exchange-accounts/repository";
import { getProviderFromAccount } from "#/features/exchange-providers/get-provider";
import { getTime, subMilliseconds } from "date-fns";

const klineSearchParamsSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
  coin: z.enum(["VST", "USDT", "USDC"]),
  symbol: z.string().min(1, "symbol is required"),
  startTime: z.coerce.number(),
  interval: z.string().default("1h"),
});

/** Expands a reference timestamp into an ideal chart window based on interval. */
export function calculateIdealStartTime(
  openTime: number,
  timeFrame: string,
  timezone = 0,
  candleCount = 200,
) {
  const match = timeFrame.match(/^(\d+)([smhdw]$)/);
  if (!match) {
    const ts = openTime;
    return { startTime: ts - timezone, endTime: ts - timezone };
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  const msPerCandle = value * (unitToMs[unit] || 0);

  const candlesLeft = 90;

  const startDate = subMilliseconds(openTime, candlesLeft * msPerCandle);
  const startTime = getTime(startDate) - timezone;
  const endTime = startTime + candleCount * msPerCandle;

  return { startTime, endTime };
}

export const Route = createFileRoute("/api/kline")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler("GET /api/kline", async ({ request }) => {
        const { accountId, coin, symbol, startTime, interval } =
          parseSearchParams(request, klineSearchParamsSchema);

        const timezone = Number(request.headers.get("Timezone")) || 0;

        const { startTime: finalStart, endTime: finalEnd } =
          calculateIdealStartTime(startTime, interval, timezone);

        console.log({
          startTime,
          finalStart,
          finalEnd,
          interval,
        });

        const account = await getAccountById(accountId);
        const provider = getProviderFromAccount(account!);
        const kline = await provider.getKLine({
          coin,
          symbol,
          startTime: finalStart,
          endTime: finalEnd,
          interval,
        });

        return new Response(JSON.stringify(kline), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    },
  },
});
