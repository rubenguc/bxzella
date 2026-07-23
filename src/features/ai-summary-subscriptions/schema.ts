import { boolean, pgTable, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

import { user } from '#/db/schema'
import { exchangeAccount } from '#/features/exchange-accounts/schema'

// ── Subscriptions ─────────────────────────────────────

export const aiSummarySubscription = pgTable(
  'ai_summary_subscription',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    accountId: text('account_id')
      .notNull()
      .references(() => exchangeAccount.id, { onDelete: 'cascade' }),

    coin: text('coin', { enum: ['VST', 'USDT', 'USDC'] as const }).notNull(),

    isActive: boolean('is_active').notNull().default(true),

    includeNotebook: boolean('include_notebook').notNull().default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('ai_summary_subscription_account_coin_idx').on(
      table.accountId,
      table.coin,
    ),
    index('ai_summary_subscription_user_id_idx').on(table.userId),
  ],
)

export type AiSummarySubscription = typeof aiSummarySubscription.$inferSelect
export type NewAiSummarySubscription = typeof aiSummarySubscription.$inferInsert

// ── Relations ─────────────────────────────────────────

export const aiSummarySubscriptionRelations = relations(
  aiSummarySubscription,
  ({ one }) => ({
    user: one(user, {
      fields: [aiSummarySubscription.userId],
      references: [user.id],
    }),
    account: one(exchangeAccount, {
      fields: [aiSummarySubscription.accountId],
      references: [exchangeAccount.id],
    }),
  }),
)
