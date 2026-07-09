import { and, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { notebook, type NewNotebook } from '#/features/notebooks/schema'

export async function getNotebookByTradeId(tradeId: string) {
  return db.query.notebook.findFirst({
    where: eq(notebook.tradeId, tradeId),
  })
}

export async function upsertNotebookByTradeId(
  tradeId: string,
  data: NewNotebook,
) {
  const existing = await getNotebookByTradeId(tradeId)

  if (existing) {
    const [updated] = await db
      .update(notebook)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notebook.id, existing.id))
      .returning()
    return updated
  }

  const [created] = await db
    .insert(notebook)
    .values({ ...data, tradeId })
    .returning()
  return created
}
