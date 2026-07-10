import { boolean, doublePrecision, pgTable, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { exchangeAccount } from '#/features/exchange-accounts/schema'

export const trade = pgTable(
  'trade',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    accountId: text('account_id').notNull().references(() => exchangeAccount.id, { onDelete: 'cascade' }),
    positionId: text('position_id').notNull(),
    symbol: text('symbol').notNull(),
    positionSide: text('position_side').notNull(),
    isolated: boolean('isolated').notNull(),
    openTime: timestamp('open_time', { withTimezone: true }).notNull(),
    updateTime: timestamp('update_time', { withTimezone: true }).notNull(),
    avgPrice: text('avg_price').notNull(),
    avgClosePrice: text('avg_close_price'),
    realisedProfit: text('realised_profit').notNull(),
    netProfit: text('net_profit').notNull(),
    positionAmt: text('position_amt').notNull(),
    closePositionAmt: text('close_position_amt'),
    leverage: doublePrecision('leverage').notNull(),
    closeAllPositions: boolean('close_all_positions').notNull().default(false),
    positionCommission: text('position_commission'),
    totalFunding: text('total_funding'),
    type: text('type', { enum: ['P', 'S'] }).notNull(),
    coin: text('coin').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex('trade_account_position_idx').on(table.accountId, table.positionId),
    index('trade_account_id_idx').on(table.accountId),
    index('trade_account_update_time_coin_idx').on(table.accountId, table.updateTime.desc(), table.coin),
    index('trade_account_symbol_coin_idx').on(table.accountId, table.symbol, table.coin),
  ],
)

export type Trade = typeof trade.$inferSelect
export type NewTrade = typeof trade.$inferInsert

export const tradeRelations = relations(trade, ({ one }) => ({
  account: one(exchangeAccount, {
    fields: [trade.accountId],
    references: [exchangeAccount.id],
  }),
}))
