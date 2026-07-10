import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { user } from '#/db/schema'

export const notebookTemplate = pgTable(
  'notebook_template',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    contentPlainText: text('content_plain_text').default('').notNull(),
    lastTimeUsed: timestamp('last_time_used', { withTimezone: true }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index('notebook_template_user_id_idx').on(table.userId),
  ],
)

export type NotebookTemplate = typeof notebookTemplate.$inferSelect
export type NewNotebookTemplate = typeof notebookTemplate.$inferInsert

export const notebookTemplateRelations = relations(notebookTemplate, ({ one }) => ({
  user: one(user, {
    fields: [notebookTemplate.userId],
    references: [user.id],
  }),
}))
