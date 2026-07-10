import { and, desc, eq, sql, count } from "drizzle-orm";
import { db } from "#/db/index";
import { trade, type NewTrade } from "#/features/trades/schema";
import { resolveEarliestTradeDate } from "#/features/trades/helpers";
import { getProviderFromAccount } from "#/features/exchange-providers/get-provider";
import {
  getAccountById,
  updateEarliestTradeDatePerCoin,
  updateLastSyncPerCoin,
} from "#/features/exchange-accounts/repository";
import type { Coin } from "#/features/exchange-providers/types";
import { logger } from "#/lib/logger";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// ── Queries ────────────────────────────────────────────

export async function getTradesByAccountId(accountId: string) {
  return db
    .select()
    .from(trade)
    .where(eq(trade.accountId, accountId))
    .orderBy(trade.openTime);
}

export async function getRecentTrades(
  accountId: string,
  coin?: Coin,
  limit = 10,
) {
  const filters = coin
    ? and(eq(trade.accountId, accountId), eq(trade.coin, coin))
    : eq(trade.accountId, accountId);

  return db
    .select()
    .from(trade)
    .where(filters)
    .orderBy(desc(trade.updateTime))
    .limit(limit);
}

export async function getTradesPaginated(
  accountId: string,
  page: number,
  limit: number,
  coin?: Coin,
) {
  const offset = page * limit;

  const filters = coin
    ? and(eq(trade.accountId, accountId), eq(trade.coin, coin))
    : eq(trade.accountId, accountId);

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(trade)
      .where(filters)
      .orderBy(desc(trade.updateTime))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(trade).where(filters),
  ]);

  const total = totalResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return { data: rows, totalPages };
}

export async function getTradeByPositionId(
  accountId: string,
  positionId: string,
) {
  return db.query.trade.findFirst({
    where: and(
      eq(trade.accountId, accountId),
      eq(trade.positionId, positionId),
    ),
  });
}

// ── Sync ───────────────────────────────────────────────

export async function syncPositions(
  accountId: string,
  coin: Coin,
): Promise<{
  synced: boolean;
  syncTime: number;
  earliestTradeDate: string;
}> {
  const account = await getAccountById(accountId);
  if (!account) {
    return { synced: false, syncTime: 0, earliestTradeDate: "" };
  }

  const provider = getProviderFromAccount(account);
  const lastSyncTime = account.lastSyncPerCoin[coin] ?? 0;

  logger.debug({ lastSyncTime }, "syncPositions");

  const rawTrades = await provider.getPositionHistory({ coin, lastSyncTime });
  if (rawTrades.length === 0) {
    return { synced: false, syncTime: 0, earliestTradeDate: "" };
  }

  const syncTime = Date.now();
  const dbRows = rawTrades.map((t) => ({ ...t, accountId }) as NewTrade);

  await db.transaction(async (tx) => {
    await upsertTrades(dbRows, tx);
    await updateLastSyncPerCoin(accountId, coin, syncTime, tx);
  });

  // Resolve earliest trade date (pure helper — no side effects)
  let earliestTradeDate = account.earliestTradeDatePerCoin[coin] ?? "";
  if (!earliestTradeDate) {
    const date = resolveEarliestTradeDate(rawTrades);
    if (date) {
      earliestTradeDate = date;
      await updateEarliestTradeDatePerCoin(accountId, coin, date);
    }
  }

  return { synced: true, syncTime, earliestTradeDate };
}

// ── Mutations ──────────────────────────────────────────

export async function upsertTrades(data: NewTrade[], tx?: Tx) {
  if (data.length === 0) return [];

  const conn = tx ?? db;
  return conn
    .insert(trade)
    .values(data)
    .onConflictDoUpdate({
      target: [trade.accountId, trade.positionId],
      set: {
        symbol: sql`excluded.symbol`,
        positionSide: sql`excluded.position_side`,
        isolated: sql`excluded.isolated`,
        openTime: sql`excluded.open_time`,
        updateTime: sql`excluded.update_time`,
        avgPrice: sql`excluded.avg_price`,
        avgClosePrice: sql`excluded.avg_close_price`,
        realisedProfit: sql`excluded.realised_profit`,
        netProfit: sql`excluded.net_profit`,
        positionAmt: sql`excluded.position_amt`,
        closePositionAmt: sql`excluded.close_position_amt`,
        leverage: sql`excluded.leverage`,
        closeAllPositions: sql`excluded.close_all_positions`,
        positionCommission: sql`excluded.position_commission`,
        totalFunding: sql`excluded.total_funding`,
        type: sql`excluded.type`,
        coin: sql`excluded.coin`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .returning();
}

export async function deleteTradesByAccountId(accountId: string) {
  await db.delete(trade).where(eq(trade.accountId, accountId));
}

export async function deleteTradeByPositionId(
  accountId: string,
  positionId: string,
) {
  await db
    .delete(trade)
    .where(
      and(eq(trade.accountId, accountId), eq(trade.positionId, positionId)),
    );
}
