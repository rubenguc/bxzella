import { json, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

import { user } from '#/db/schema'

export const exchangeAccount = pgTable('exchange_account', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),

  provider: text('provider', { enum: ['bingx', 'bitunix'] as const })
    .notNull(),

  apiKey: text('api_key').notNull(),
  secretKey: text('secret_key').notNull(),
  /** SHA-256 hex hash of the plaintext API key for deterministic duplicate checking. */
  apiKeyHash: text('api_key_hash').notNull(),

  /**
   * Per-coin timestamps (epoch ms) of the last successful sync.
   * e.g. { "USDT": 1719876543210, "VST": 1719876543210 }
   */
  lastSyncPerCoin: json('last_sync_per_coin')
    .$type<Partial<Record<string, number>>>()
    .notNull()
    .default({}),

  /**
   * Per-coin earliest trade dates (ISO strings).
   * Used by dashboard to set default date-range per coin.
   * e.g. { "USDT": "2024-01-15T00:00:00.000Z", "VST": "2024-03-01T00:00:00.000Z" }
   */
  earliestTradeDatePerCoin: json('earliest_trade_date_per_coin')
    .$type<Partial<Record<string, string>>>()
    .notNull()
    .default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type ExchangeAccount = typeof exchangeAccount.$inferSelect
export type NewExchangeAccount = typeof exchangeAccount.$inferInsert

export const exchangeAccountRelations = relations(
  exchangeAccount,
  ({ one }) => ({
    user: one(user, {
      fields: [exchangeAccount.userId],
      references: [user.id],
    }),
  }),
)
