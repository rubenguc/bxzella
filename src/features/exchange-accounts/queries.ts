import { and, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { exchangeAccount } from '#/features/exchange-accounts/schema'
import type { ProviderValue } from '#/features/exchange-providers/types'

// ── Queries ────────────────────────────────────────────

export async function getAccountsByUserId(userId: string) {
  return db
    .select({
      id: exchangeAccount.id,
      name: exchangeAccount.name,
      provider: exchangeAccount.provider,
      lastSyncPerCoin: exchangeAccount.lastSyncPerCoin,
      earliestTradeDatePerCoin: exchangeAccount.earliestTradeDatePerCoin,
      createdAt: exchangeAccount.createdAt,
      updatedAt: exchangeAccount.updatedAt,
    })
    .from(exchangeAccount)
    .where(eq(exchangeAccount.userId, userId))
    .orderBy(exchangeAccount.createdAt)
}

export async function getAccountById(id: string) {
  return db.query.exchangeAccount.findFirst({
    where: eq(exchangeAccount.id, id),
  })
}

export async function getAccountByIdAndUserId(id: string, userId: string) {
  return db.query.exchangeAccount.findFirst({
    where: and(eq(exchangeAccount.id, id), eq(exchangeAccount.userId, userId)),
  })
}

export async function getAccountByProviderAndApiKey(
  apiKeyHash: string,
  provider: ProviderValue,
) {
  return db.query.exchangeAccount.findFirst({
    where: and(
      eq(exchangeAccount.apiKeyHash, apiKeyHash),
      eq(exchangeAccount.provider, provider),
    ),
  })
}

export async function getAccountsByUserIdAndProvider(
  userId: string,
  provider: ProviderValue,
) {
  return db
    .select()
    .from(exchangeAccount)
    .where(
      and(
        eq(exchangeAccount.userId, userId),
        eq(exchangeAccount.provider, provider),
      ),
    )
}

// ── Mutations ──────────────────────────────────────────

export async function createAccount(
  data: typeof exchangeAccount.$inferInsert,
) {
  const [row] = await db.insert(exchangeAccount).values(data).returning()
  return row
}

export async function updateAccount(
  id: string,
  data: Partial<typeof exchangeAccount.$inferInsert>,
) {
  const [row] = await db
    .update(exchangeAccount)
    .set(data)
    .where(eq(exchangeAccount.id, id))
    .returning()
  return row
}

export async function deleteAccount(id: string) {
  const [row] = await db
    .delete(exchangeAccount)
    .where(eq(exchangeAccount.id, id))
    .returning()
  return row
}
