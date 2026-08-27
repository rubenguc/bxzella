import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

import { user } from '#/db/schema'
import { trade } from '#/features/trades/schema'

export const strategy = pgTable(
  'strategy',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index('strategy_user_id_idx').on(table.userId),
  ],
)

export type Strategy = typeof strategy.$inferSelect
export type NewStrategy = typeof strategy.$inferInsert

export const strategyRuleGroup = pgTable(
  'strategy_rule_group',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    strategyId: text('strategy_id').notNull().references(() => strategy.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index('strategy_rule_group_strategy_id_idx').on(table.strategyId),
  ],
)

export type StrategyRuleGroup = typeof strategyRuleGroup.$inferSelect
export type NewStrategyRuleGroup = typeof strategyRuleGroup.$inferInsert

export const strategyRule = pgTable(
  'strategy_rule',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    ruleGroupId: text('rule_group_id').notNull().references(() => strategyRuleGroup.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index('strategy_rule_rule_group_id_idx').on(table.ruleGroupId),
  ],
)

export type StrategyRule = typeof strategyRule.$inferSelect
export type NewStrategyRule = typeof strategyRule.$inferInsert

export const tradeRuleCheck = pgTable(
  'trade_rule_check',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tradeId: text('trade_id').notNull().references(() => trade.id, { onDelete: 'cascade' }),
    ruleId: text('rule_id').notNull().references(() => strategyRule.id, { onDelete: 'cascade' }),
    followed: boolean('followed').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('trade_rule_check_trade_rule_idx').on(table.tradeId, table.ruleId),
    index('trade_rule_check_rule_id_idx').on(table.ruleId),
  ],
)

export type TradeRuleCheck = typeof tradeRuleCheck.$inferSelect
export type NewTradeRuleCheck = typeof tradeRuleCheck.$inferInsert

export const strategyRelations = relations(strategy, ({ many, one }) => ({
  user: one(user, {
    fields: [strategy.userId],
    references: [user.id],
  }),
  ruleGroups: many(strategyRuleGroup),
  trades: many(trade),
}))

export const strategyRuleGroupRelations = relations(strategyRuleGroup, ({ many, one }) => ({
  strategy: one(strategy, {
    fields: [strategyRuleGroup.strategyId],
    references: [strategy.id],
  }),
  rules: many(strategyRule),
}))

export const strategyRuleRelations = relations(strategyRule, ({ many, one }) => ({
  ruleGroup: one(strategyRuleGroup, {
    fields: [strategyRule.ruleGroupId],
    references: [strategyRuleGroup.id],
  }),
  checks: many(tradeRuleCheck),
}))

export const tradeRuleCheckRelations = relations(tradeRuleCheck, ({ one }) => ({
  trade: one(trade, {
    fields: [tradeRuleCheck.tradeId],
    references: [trade.id],
  }),
  rule: one(strategyRule, {
    fields: [tradeRuleCheck.ruleId],
    references: [strategyRule.id],
  }),
}))