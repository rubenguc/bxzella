import { pgTable, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { exchangeAccount } from '#/features/exchange-accounts/schema'
import { trade } from '#/features/trades/schema'

export const notebook = pgTable(
  'notebook',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    content: text('content'),
    contentPlainText: text('content_plain_text'),
    tradeId: text('trade_id').references(() => trade.id, { onDelete: 'set null' }),
    accountId: text('account_id').notNull().references(() => exchangeAccount.id, { onDelete: 'cascade' }),
    coin: text('coin', { enum: ['VST', 'USDT', 'USDC'] }).notNull(),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index('notebook_account_id_idx').on(table.accountId),
    uniqueIndex('notebook_trade_id_unique_idx').on(table.tradeId),
  ],
)

export type Notebook = typeof notebook.$inferSelect
export type NewNotebook = typeof notebook.$inferInsert

export const notebookRelations = relations(notebook, ({ one }) => ({
  account: one(exchangeAccount, {
    fields: [notebook.accountId],
    references: [exchangeAccount.id],
  }),
  trade: one(trade, {
    fields: [notebook.tradeId],
    references: [trade.id],
  }),
}))
