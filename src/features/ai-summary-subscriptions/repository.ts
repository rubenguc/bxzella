import { and, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { aiSummarySubscription } from '#/features/ai-summary-subscriptions/schema'
import { exchangeAccount } from '#/features/exchange-accounts/schema'

// ── Queries ────────────────────────────────────────────

export async function getSubscriptionsByUserId(userId: string) {
  return db
    .select({
      id: aiSummarySubscription.id,
      userId: aiSummarySubscription.userId,
      accountId: aiSummarySubscription.accountId,
      coin: aiSummarySubscription.coin,
      isActive: aiSummarySubscription.isActive,
      includeNotebook: aiSummarySubscription.includeNotebook,
      createdAt: aiSummarySubscription.createdAt,
      updatedAt: aiSummarySubscription.updatedAt,
      accountName: exchangeAccount.name,
      accountProvider: exchangeAccount.provider,
    })
    .from(aiSummarySubscription)
    .innerJoin(
      exchangeAccount,
      eq(aiSummarySubscription.accountId, exchangeAccount.id),
    )
    .where(eq(aiSummarySubscription.userId, userId))
    .orderBy(aiSummarySubscription.createdAt)
}

export async function getSubscriptionById(id: string) {
  return db.query.aiSummarySubscription.findFirst({
    where: eq(aiSummarySubscription.id, id),
  })
}

export async function getSubscriptionByIdAndUserId(
  id: string,
  userId: string,
) {
  return db.query.aiSummarySubscription.findFirst({
    where: and(
      eq(aiSummarySubscription.id, id),
      eq(aiSummarySubscription.userId, userId),
    ),
  })
}

/** Check if a subscription already exists for this account + coin. */
export async function getSubscriptionByAccountAndCoin(
  accountId: string,
  coin: 'VST' | 'USDT' | 'USDC',
) {
  return db.query.aiSummarySubscription.findFirst({
    where: and(
      eq(aiSummarySubscription.accountId, accountId),
      eq(aiSummarySubscription.coin, coin),
    ),
  })
}

// ── Mutations ──────────────────────────────────────────

export async function createSubscription(
  data: typeof aiSummarySubscription.$inferInsert,
) {
  const [row] = await db
    .insert(aiSummarySubscription)
    .values(data)
    .returning()
  return row
}

export async function toggleSubscriptionActive(id: string, isActive: boolean) {
  const [row] = await db
    .update(aiSummarySubscription)
    .set({ isActive })
    .where(eq(aiSummarySubscription.id, id))
    .returning()
  return row
}

export async function deleteSubscription(id: string) {
  const [row] = await db
    .delete(aiSummarySubscription)
    .where(eq(aiSummarySubscription.id, id))
    .returning()
  return row
}
