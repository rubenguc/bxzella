import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth";
import { wrapAction } from "#/lib/server-action";
import { logger } from "#/lib/logger";
import {
  getAllTradesByAccountAndCoin,
  getTradesByDateRange,
  getTradesTopN,
  getNotebookPlainTextByTradeIds,
} from "#/features/trades/repository";
import type { TradeExportItem } from "#/features/trades/types";

const log = logger.child({ name: "trades-export" });

const exportTradesSchema = z.object({
  accountId: z.string().min(1),
  coin: z.enum(["USDT", "USDC", "VST"]),
  scope: z.enum(["all", "custom"]),
  mode: z.enum(["dateRange", "quantity"]).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.number().int().min(1).optional(),
  includeNotebooks: z.boolean().optional().default(true),
});

export const exportTradesAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as z.infer<typeof exportTradesSchema>)
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = exportTradesSchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_export_params");

      const headers = getRequestHeaders();
      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) throw new Error("unauthorized");

      const { accountId, coin, scope, mode, startDate, endDate, limit, includeNotebooks } =
        parsed.data;

      let trades;
      if (scope === "all") {
        trades = await getAllTradesByAccountAndCoin(accountId, coin);
      } else if (mode === "dateRange" && startDate && endDate) {
        trades = await getTradesByDateRange(
          accountId,
          coin,
          new Date(startDate),
          new Date(endDate),
        );
      } else if (mode === "quantity" && limit) {
        trades = await getTradesTopN(accountId, coin, limit);
      } else {
        throw new Error("invalid_export_params");
      }

      const tradeIds = trades.map((t) => t.id);
      const notebookMap = includeNotebooks
        ? await getNotebookPlainTextByTradeIds(tradeIds)
        : new Map<string, string | null>();

      const exportItems: TradeExportItem[] = trades.map((t) => ({
        positionId: t.positionId,
        symbol: t.symbol,
        positionSide: t.positionSide,
        isolated: t.isolated,
        openTime: t.openTime,
        updateTime: t.updateTime,
        avgPrice: t.avgPrice,
        avgClosePrice: t.avgClosePrice,
        realisedProfit: t.realisedProfit,
        netProfit: t.netProfit,
        positionAmt: t.positionAmt,
        closePositionAmt: t.closePositionAmt,
        leverage: t.leverage,
        closeAllPositions: t.closeAllPositions,
        positionCommission: t.positionCommission,
        totalFunding: t.totalFunding,
        type: t.type,
        coin: t.coin,
        notebookContentPlainText: includeNotebooks ? (notebookMap.get(t.id) ?? null) : null,
      }));

      return exportItems;
    });
  });
