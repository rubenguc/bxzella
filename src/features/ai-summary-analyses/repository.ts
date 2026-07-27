import { and, eq, desc, sql } from 'drizzle-orm'
import { db } from '#/db/index'
import {
  aiSummaryAnalysis,
  type NewAiSummaryAnalysis,
} from '#/features/ai-summary-analyses/schema'

// ── Queries ────────────────────────────────────────────

export async function getAnalysisBySubscriptionAndWeek(
  subscriptionId: string,
  weekStart: Date,
) {
  return db.query.aiSummaryAnalysis.findFirst({
    where: and(
      eq(aiSummaryAnalysis.subscriptionId, subscriptionId),
      eq(aiSummaryAnalysis.weekStart, weekStart),
    ),
  })
}

export async function getAnalysesBySubscriptionId(
  subscriptionId: string,
  options: { limit?: number; offset?: number } = {},
) {
  const { limit = 20, offset = 0 } = options

  const rows = await db
    .select()
    .from(aiSummaryAnalysis)
    .where(eq(aiSummaryAnalysis.subscriptionId, subscriptionId))
    .orderBy(desc(aiSummaryAnalysis.weekStart))
    .limit(limit)
    .offset(offset)

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiSummaryAnalysis)
    .where(eq(aiSummaryAnalysis.subscriptionId, subscriptionId))

  return {
    rows,
    total: Number(countResult.count),
    limit,
    offset,
  }
}

// ── Mutations ──────────────────────────────────────────

export async function upsertAnalysis(
  data: Pick<
    NewAiSummaryAnalysis,
    'subscriptionId' | 'weekStart' | 'weekEnd' | 'version' | 'analysis'
  >,
) {
  const existing = await getAnalysisBySubscriptionAndWeek(
    data.subscriptionId,
    data.weekStart,
  )

  if (existing) {
    const [row] = await db
      .update(aiSummaryAnalysis)
      .set({
        weekEnd: data.weekEnd,
        version: data.version,
        analysis: data.analysis,
        updatedAt: new Date(),
      })
      .where(eq(aiSummaryAnalysis.id, existing.id))
      .returning()
    return row
  }

  const [row] = await db
    .insert(aiSummaryAnalysis)
    .values(data)
    .returning()
  return row
}
