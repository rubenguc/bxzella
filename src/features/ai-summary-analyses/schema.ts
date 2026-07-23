import { jsonb, pgTable, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { aiSummarySubscription } from '#/features/ai-summary-subscriptions/schema'

export const aiSummaryAnalysis = pgTable(
  'ai_summary_analysis',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    subscriptionId: text('subscription_id')
      .notNull()
      .references(() => aiSummarySubscription.id, { onDelete: 'cascade' }),

    weekStart: timestamp('week_start', { withTimezone: true }).notNull(),
    weekEnd: timestamp('week_end', { withTimezone: true }).notNull(),

    version: text('version').notNull(),

    analysis: jsonb('analysis'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('ai_summary_analysis_subscription_week_idx').on(
      table.subscriptionId,
      table.weekStart,
    ),
    index('ai_summary_analysis_subscription_id_idx').on(table.subscriptionId),
  ],
)

export type AiSummaryAnalysis = typeof aiSummaryAnalysis.$inferSelect
export type NewAiSummaryAnalysis = typeof aiSummaryAnalysis.$inferInsert

export const aiSummaryAnalysisRelations = relations(
  aiSummaryAnalysis,
  ({ one }) => ({
    subscription: one(aiSummarySubscription, {
      fields: [aiSummaryAnalysis.subscriptionId],
      references: [aiSummarySubscription.id],
    }),
  }),
)
