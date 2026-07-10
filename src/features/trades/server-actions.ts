import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db/index";
import { auth } from "#/lib/auth";
import { wrapAction } from "#/lib/server-action";
import { logger } from "#/lib/logger";
import { getAccountByIdAndUserId } from "#/features/exchange-accounts/repository";
import { exchangeAccount } from "#/features/exchange-accounts/schema";
import { upsertTrades } from "#/features/trades/repository";
import { resolveEarliestTradeDate } from "#/features/trades/helpers";
import { notebook } from "#/features/notebooks/schema";

const log = logger.child({ name: "trades-import" });

const importTradeSchema = z.object({
  fileContent: z.string().min(1, "file_content_required"),
  accountId: z.string().min(1, "account_id_required"),
});

async function getUserId(): Promise<string> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("unauthorized");
  return session.user.id;
}

function extractDate(item: unknown): Date | undefined {
  if (!item) return undefined;
  if (typeof item === "string") return new Date(item);
  if (typeof item === "object" && item !== null && "$date" in item)
    return new Date((item as { $date: string }).$date);
  return undefined;
}

export const importTradesAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { fileContent: string; accountId: string })
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = importTradeSchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_data");

      const userId = await getUserId();
      const { fileContent, accountId } = parsed.data;

      const account = await getAccountByIdAndUserId(accountId, userId);
      if (!account) throw new Error("account_not_found");

      let rawData: unknown[];
      try {
        rawData = JSON.parse(fileContent);
      } catch {
        throw new Error("invalid_json");
      }
      if (!Array.isArray(rawData)) throw new Error("invalid_file");

      const result = await db.transaction(async (tx) => {
        const tradeRows = rawData.map((raw) => {
          const item = raw as Record<string, unknown>;
          return {
          accountId,
          positionId: String(item.positionId ?? ""),
          symbol: String(item.symbol ?? ""),
          positionSide: String(item.positionSide ?? ""),
          isolated: Boolean(item.isolated),
          openTime: extractDate(item.openTime) ?? new Date(),
          updateTime: extractDate(item.updateTime) ?? new Date(),
          avgPrice: String(item.avgPrice ?? "0"),
          avgClosePrice: item.avgClosePrice != null ? String(item.avgClosePrice) : null,
          realisedProfit: String(item.realisedProfit ?? "0"),
          netProfit: String(item.netProfit ?? "0"),
          positionAmt: String(item.positionAmt ?? "0"),
          closePositionAmt: item.closePositionAmt != null ? String(item.closePositionAmt) : null,
          leverage: Number(item.leverage ?? 1),
          closeAllPositions: item.closeAllPositions === true || item.closeAllPositions === "true",
          positionCommission: item.positionCommission != null ? String(item.positionCommission) : null,
          totalFunding: item.totalFunding != null ? String(item.totalFunding) : null,
          type: (String(item.type ?? "P") as "P" | "S"),
          coin: String(item.coin ?? "USDT"),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        });

        const insertedTrades = await upsertTrades(tradeRows, tx);

        const notebookRows: (typeof notebook.$inferInsert)[] = [];

        for (const item of rawData) {
          const rawItem = item as Record<string, unknown>;
          const notebooks = (rawItem.notebooks as Record<string, unknown>[]) ?? [];
          const firstNotebook = notebooks[0];
          if (!firstNotebook) continue;

          const insertedTrade = insertedTrades.find(
            (t) => t.positionId === String(rawItem.positionId),
          );
          if (!insertedTrade) continue;

          notebookRows.push({
            content:
              typeof firstNotebook.content === "string"
                ? firstNotebook.content
                : null,
            contentPlainText:
              typeof firstNotebook.contentPlainText === "string"
                ? firstNotebook.contentPlainText
                : null,
            tradeId: insertedTrade.id,
            accountId,
            coin:
              typeof firstNotebook.coin === "string"
                ? firstNotebook.coin
                : rawItem.coin,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as typeof notebook.$inferInsert);
        }

        if (notebookRows.length > 0) {
          await tx
            .insert(notebook)
            .values(notebookRows)
            .onConflictDoNothing({ target: notebook.tradeId });
        }

        const acc = await tx.query.exchangeAccount.findFirst({
          where: eq(exchangeAccount.id, accountId),
          columns: { earliestTradeDatePerCoin: true },
        });
        const merged = acc?.earliestTradeDatePerCoin ?? {};
        for (const coin of [...new Set(insertedTrades.map((t) => t.coin))]) {
          const importedDate = resolveEarliestTradeDate(
            insertedTrades.filter((t) => t.coin === coin),
          );
          if (!importedDate) continue;
          if (!merged[coin] || importedDate < merged[coin]) {
            merged[coin] = importedDate;
          }
        }
        await tx
          .update(exchangeAccount)
          .set({ earliestTradeDatePerCoin: merged })
          .where(eq(exchangeAccount.id, accountId));

        return {
          tradesCount: insertedTrades.length,
          notebooksCount: notebookRows.length,
        };
      });

      log.info({ ...result, accountId }, "trades imported");

      return result;
    });
  });
