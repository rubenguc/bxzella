import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "#/db/index";
import {
  strategy,
  strategyRule,
  strategyRuleGroup,
  tradeRuleCheck,
} from "./schema";
import { trade, type Trade } from "#/features/trades/schema";
import type { DayProfitEntry } from "#/features/dashboard/types";
import type {
  PaginatedStrategiesResponse,
  Playbook,
  RuleGroupStats,
  StrategyStats,
  StrategyWithPlaybook,
  TradeRuleCheckRow,
} from "./types";
import type { StrategyForm } from "./validation";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface StrategyStatsRow {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalTrades: number;
  netPnL: number;
  winRate: number;
}

interface RuleStatsRow {
  groupId: string;
  groupTitle: string;
  groupPosition: number;
  ruleId: string;
  ruleTitle: string;
  rulePosition: number;
  followedTrades: number;
  netPnL: number;
  winCount: number;
  lossCount: number;
  sumWin: number;
  sumLoss: number;
}

// ── Queries ────────────────────────────────────────────

/** Lightweight list for the trade-detail strategy selector. */
export async function getStrategiesByUserId(userId: string) {
  return db
    .select({ id: strategy.id, title: strategy.title })
    .from(strategy)
    .where(eq(strategy.userId, userId))
    .orderBy(desc(strategy.createdAt));
}

export async function getStrategiesWithStats(
  userId: string,
  accountId: string,
  coin: string,
  page: number,
  limit: number,
): Promise<PaginatedStrategiesResponse> {
  const offset = page * limit;

  const [rowsResult, totalResult] = await Promise.all([
    db.execute(sql`
      SELECT
        s.id,
        s.title,
        s.description,
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        COALESCE(st.total_trades, 0)::int AS "totalTrades",
        COALESCE(st.net_pnl, 0) AS "netPnL",
        CASE
          WHEN st.total_trades > 0 THEN (st.win_count::numeric / st.total_trades * 100)
          ELSE 0
        END AS "winRate"
      FROM strategy s
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)::int AS total_trades,
          COALESCE(SUM(net_profit::numeric), 0) AS net_pnl,
          COUNT(*) FILTER (WHERE net_profit::numeric > 0)::int AS win_count
        FROM trade t
        WHERE t.strategy_id = s.id
          AND t.account_id = ${accountId}
          AND t.coin = ${coin}
          AND t.close_all_positions = true
      ) st ON true
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `),
    db
      .select({ total: count() })
      .from(strategy)
      .where(eq(strategy.userId, userId)),
  ]);

  const total = totalResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const data = ((rowsResult.rows ?? []) as unknown as StrategyStatsRow[]).map(
    (row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      totalTrades: Number(row.totalTrades) || 0,
      netPnL: Number(row.netPnL) || 0,
      winRate: Number(row.winRate) || 0,
    }),
  );

  return { data, totalPages };
}

export async function getStrategyByIdAndUserId(
  strategyId: string,
  userId: string,
) {
  return db.query.strategy.findFirst({
    where: and(eq(strategy.id, strategyId), eq(strategy.userId, userId)),
  });
}

export async function getStrategyWithPlaybook(
  strategyId: string,
  userId: string,
): Promise<StrategyWithPlaybook | null> {
  return getStrategyWithPlaybookConn(db, strategyId, userId);
}

async function getStrategyWithPlaybookConn(
  conn: typeof db | Tx,
  strategyId: string,
  userId: string,
): Promise<StrategyWithPlaybook | null> {
  const found = await conn.query.strategy.findFirst({
    where: and(eq(strategy.id, strategyId), eq(strategy.userId, userId)),
  });

  if (!found) return null;

  const groups = await conn.query.strategyRuleGroup.findMany({
    where: eq(strategyRuleGroup.strategyId, strategyId),
    orderBy: (g, { asc }) => [asc(g.position)],
    with: {
      rules: {
        orderBy: (r, { asc }) => [asc(r.position)],
      },
    },
  });

  return {
    id: found.id,
    title: found.title,
    description: found.description,
    ruleGroups: groups.map((group) => ({
      id: group.id,
      title: group.title,
      position: group.position,
      rules: group.rules.map((rule) => ({
        id: rule.id,
        title: rule.title,
        position: rule.position,
      })),
    })),
  };
}

export async function getStrategyStats(
  strategyId: string,
  accountId: string,
  coin: string,
): Promise<StrategyStats> {
  const [statsResult, dayProfitsResult] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS "totalTrades",
        COUNT(*) FILTER (WHERE net_profit::numeric > 0)::int AS "totalWin",
        COUNT(*) FILTER (WHERE net_profit::numeric < 0)::int AS "totalLoss",
        COALESCE(SUM(CASE WHEN net_profit::numeric > 0 THEN net_profit::numeric ELSE 0 END), 0) AS "sumWin",
        COALESCE(SUM(CASE WHEN net_profit::numeric < 0 THEN net_profit::numeric ELSE 0 END), 0) AS "sumLoss",
        COALESCE(SUM(net_profit::numeric), 0) AS "netPnL"
      FROM "trade"
      WHERE strategy_id = ${strategyId}
        AND account_id = ${accountId}
        AND coin = ${coin}
        AND close_all_positions = true
    `),
    db.execute(sql`
      SELECT
        update_time::date AS "date",
        COALESCE(SUM(net_profit::numeric), 0) AS "netPnL"
      FROM "trade"
      WHERE strategy_id = ${strategyId}
        AND account_id = ${accountId}
        AND coin = ${coin}
        AND close_all_positions = true
      GROUP BY update_time::date
      ORDER BY update_time::date ASC
    `),
  ]);

  const raw = statsResult.rows?.[0] as
    | {
        totalTrades: number;
        totalWin: number;
        totalLoss: number;
        sumWin: number;
        sumLoss: number;
        netPnL: number;
      }
    | undefined;

  const dayProfits = (
    (dayProfitsResult.rows ?? []) as unknown as DayProfitEntry[]
  ).map((row) => ({
    date: row.date,
    netPnL: Number(row.netPnL) || 0,
  }));

  if (!raw) {
    return {
      netPnL: { value: 0, totalTrades: 0 },
      profitFactor: { value: 0, sumWin: 0, sumLoss: 0 },
      tradeWin: { value: 0, totalWin: 0, totalLoss: 0 },
      avgWinLoss: { value: 0, avgWin: 0, avgLoss: 0 },
      dayProfits,
    };
  }

  const totalTrades = raw.totalTrades ?? 0;
  const totalWin = raw.totalWin ?? 0;
  const totalLoss = raw.totalLoss ?? 0;
  const sumWin = Number(raw.sumWin) || 0;
  const sumLoss = Number(raw.sumLoss) || 0;
  const sumLossAbs = Math.abs(sumLoss);
  const netPnL = Number(raw.netPnL) || 0;

  // profitFactor = sumWin / abs(sumLoss), or sumWin if loss is 0
  const profitFactorValue = sumLossAbs === 0 ? sumWin : sumWin / sumLossAbs;

  // tradeWin percentage = (totalWin / totalTrades) * 100
  const tradeWinValue = totalTrades > 0 ? (totalWin / totalTrades) * 100 : 0;

  // avgWinLoss
  const avgWin = totalWin > 0 ? sumWin / totalWin : 0;
  const avgLoss = totalLoss > 0 ? sumLossAbs / totalLoss : 0;
  const avgWinLossValue = avgWin > 0 && avgLoss > 0 ? avgWin / avgLoss : 0;

  return {
    netPnL: { value: netPnL, totalTrades },
    profitFactor: { value: profitFactorValue, sumWin, sumLoss: sumLossAbs },
    tradeWin: { value: tradeWinValue, totalWin, totalLoss },
    avgWinLoss: { value: avgWinLossValue, avgWin, avgLoss },
    dayProfits,
  };
}

export async function getStrategyRuleStats(
  strategyId: string,
  accountId: string,
  coin: string,
): Promise<Playbook> {
  const [totalResult, rowsResult] = await Promise.all([
    db.execute(sql`
      SELECT COUNT(*)::int AS total
      FROM trade
      WHERE strategy_id = ${strategyId}
        AND account_id = ${accountId}
        AND coin = ${coin}
        AND close_all_positions = true
    `),
    db.execute(sql`
      SELECT
        g.id AS "groupId",
        g.title AS "groupTitle",
        g.position AS "groupPosition",
        r.id AS "ruleId",
        r.title AS "ruleTitle",
        r.position AS "rulePosition",
        COUNT(t.id)::int AS "followedTrades",
        COALESCE(SUM(t.net_profit::numeric), 0) AS "netPnL",
        COUNT(t.id) FILTER (WHERE t.net_profit::numeric > 0)::int AS "winCount",
        COUNT(t.id) FILTER (WHERE t.net_profit::numeric < 0)::int AS "lossCount",
        COALESCE(SUM(CASE WHEN t.net_profit::numeric > 0 THEN t.net_profit::numeric ELSE 0 END), 0) AS "sumWin",
        COALESCE(SUM(CASE WHEN t.net_profit::numeric < 0 THEN t.net_profit::numeric ELSE 0 END), 0) AS "sumLoss"
      FROM strategy_rule_group g
      JOIN strategy_rule r ON r.rule_group_id = g.id
      LEFT JOIN trade_rule_check c ON c.rule_id = r.id AND c.followed = true
      LEFT JOIN trade t ON t.id = c.trade_id
        AND t.strategy_id = ${strategyId}
        AND t.account_id = ${accountId}
        AND t.coin = ${coin}
        AND t.close_all_positions = true
      WHERE g.strategy_id = ${strategyId}
      GROUP BY g.id, g.title, g.position, r.id, r.title, r.position
      ORDER BY g.position ASC, r.position ASC
    `),
  ]);

  const totalRaw = totalResult.rows?.[0] as { total?: number } | undefined;
  const totalTrades = Number(totalRaw?.total) || 0;

  const rows = (rowsResult.rows ?? []) as unknown as RuleStatsRow[];

  // Map keyed by groupId preserves first-seen order (rows are position-ordered)
  const groupsMap = new Map<string, RuleGroupStats>();

  for (const row of rows) {
    let group = groupsMap.get(row.groupId);
    if (!group) {
      group = {
        ruleGroupId: row.groupId,
        title: row.groupTitle,
        position: row.groupPosition,
        rules: [],
      };
      groupsMap.set(row.groupId, group);
    }

    const followedTrades = row.followedTrades ?? 0;
    const sumWin = Number(row.sumWin) || 0;
    const sumLossAbs = Math.abs(Number(row.sumLoss) || 0);
    const netPnL = Number(row.netPnL) || 0;

    const followRate = totalTrades > 0 ? (followedTrades / totalTrades) * 100 : 0;
    const profitFactor = sumLossAbs === 0 ? sumWin : sumWin / sumLossAbs;
    const winRate =
      followedTrades > 0 ? ((row.winCount ?? 0) / followedTrades) * 100 : 0;

    group.rules.push({
      ruleId: row.ruleId,
      title: row.ruleTitle,
      position: row.rulePosition,
      followRate,
      netPnL,
      profitFactor,
      winRate,
      followedTrades,
    });
  }

  return { totalTrades, groups: [...groupsMap.values()] };
}

export async function getStrategyTradesPaginated(
  strategyId: string,
  accountId: string,
  coin: string,
  page: number,
  limit: number,
): Promise<{ data: Trade[]; totalPages: number }> {
  const offset = page * limit;

  const where = and(
    eq(trade.strategyId, strategyId),
    eq(trade.accountId, accountId),
    eq(trade.coin, coin),
  );

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(trade)
      .where(where)
      .orderBy(desc(trade.updateTime))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(trade).where(where),
  ]);

  const total = totalResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return { data: rows, totalPages };
}

export async function getTradeRuleChecksByTradeId(
  tradeId: string,
): Promise<TradeRuleCheckRow[]> {
  return db
    .select({
      ruleId: tradeRuleCheck.ruleId,
      followed: tradeRuleCheck.followed,
    })
    .from(tradeRuleCheck)
    .where(eq(tradeRuleCheck.tradeId, tradeId));
}

// ── Mutations ──────────────────────────────────────────

export async function createStrategyWithPlaybook(
  userId: string,
  data: StrategyForm,
) {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(strategy)
      .values({
        userId,
        title: data.title,
        description: data.description ?? null,
      })
      .returning();

    for (const [gi, group] of data.ruleGroups.entries()) {
      const [createdGroup] = await tx
        .insert(strategyRuleGroup)
        .values({ strategyId: created.id, title: group.title, position: gi })
        .returning();

      for (const [ri, rule] of group.rules.entries()) {
        await tx.insert(strategyRule).values({
          ruleGroupId: createdGroup.id,
          title: rule.title,
          position: ri,
        });
      }
    }

    return getStrategyWithPlaybookConn(tx, created.id, userId);
  });
}

export async function updateStrategyWithPlaybook(
  strategyId: string,
  userId: string,
  data: StrategyForm,
) {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(strategy)
      .set({ title: data.title, description: data.description ?? null })
      .where(and(eq(strategy.id, strategyId), eq(strategy.userId, userId)))
      .returning();

    if (!updated) return null;

    const existingGroups = await tx.query.strategyRuleGroup.findMany({
      where: eq(strategyRuleGroup.strategyId, strategyId),
      with: { rules: true },
    });
    const validGroupIds = new Set(existingGroups.map((g) => g.id));
    const payloadGroupIds = new Set(
      data.ruleGroups
        .map((g) => g.id)
        .filter((id): id is string => Boolean(id)),
    );

    // Delete groups absent from the payload (cascade removes rules/checks)
    for (const group of existingGroups) {
      if (!payloadGroupIds.has(group.id)) {
        await tx
          .delete(strategyRuleGroup)
          .where(eq(strategyRuleGroup.id, group.id));
      }
    }

    for (const [gi, group] of data.ruleGroups.entries()) {
      let groupId: string;
      let existingRules: typeof strategyRule.$inferSelect[] = [];

      if (group.id && validGroupIds.has(group.id)) {
        await tx
          .update(strategyRuleGroup)
          .set({ title: group.title, position: gi })
          .where(eq(strategyRuleGroup.id, group.id));
        groupId = group.id;
        existingRules =
          existingGroups.find((g) => g.id === group.id)?.rules ?? [];
      } else {
        const [createdGroup] = await tx
          .insert(strategyRuleGroup)
          .values({ strategyId, title: group.title, position: gi })
          .returning();
        groupId = createdGroup.id;
      }

      const validRuleIds = new Set(existingRules.map((r) => r.id));
      const payloadRuleIds = new Set(
        group.rules
          .map((r) => r.id)
          .filter((id): id is string => Boolean(id)),
      );

      // Delete rules of this group absent from the payload
      for (const rule of existingRules) {
        if (validRuleIds.has(rule.id) && !payloadRuleIds.has(rule.id)) {
          await tx.delete(strategyRule).where(eq(strategyRule.id, rule.id));
        }
      }

      for (const [ri, rule] of group.rules.entries()) {
        if (rule.id && validRuleIds.has(rule.id)) {
          await tx
            .update(strategyRule)
            .set({ title: rule.title, position: ri })
            .where(eq(strategyRule.id, rule.id));
        } else {
          await tx.insert(strategyRule).values({
            ruleGroupId: groupId,
            title: rule.title,
            position: ri,
          });
        }
      }
    }

    return getStrategyWithPlaybookConn(tx, strategyId, userId);
  });
}

export async function deleteStrategy(strategyId: string, userId: string) {
  const [deleted] = await db
    .delete(strategy)
    .where(and(eq(strategy.id, strategyId), eq(strategy.userId, userId)))
    .returning();

  return deleted ?? null;
}

export async function setTradeStrategyAndChecks(
  tradeId: string,
  strategyId: string | null,
  checks: { ruleId: string; followed: boolean }[],
) {
  await db.transaction(async (tx) => {
    await tx.update(trade).set({ strategyId }).where(eq(trade.id, tradeId));
    await tx.delete(tradeRuleCheck).where(eq(tradeRuleCheck.tradeId, tradeId));

    if (checks.length > 0) {
      await tx.insert(tradeRuleCheck).values(
        checks.map((c) => ({
          tradeId,
          ruleId: c.ruleId,
          followed: c.followed,
        })),
      );
    }
  });
}