import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import {
  notebookTemplate,
  type NewNotebookTemplate,
} from '#/features/notebooks-templates/schema'

export async function getNotebookTemplates(
  userId: string,
  page: number,
  limit: number,
) {
  const offset = page * limit

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(notebookTemplate)
      .where(eq(notebookTemplate.userId, userId))
      .orderBy(desc(notebookTemplate.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(notebookTemplate)
      .where(eq(notebookTemplate.userId, userId)),
  ])

  const total = totalResult[0]?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return { data: rows, totalPages }
}

export async function createNotebookTemplate(
  data: NewNotebookTemplate,
) {
  const [created] = await db
    .insert(notebookTemplate)
    .values(data)
    .returning()
  return created
}

export async function updateNotebookTemplate(
  id: string,
  userId: string,
  data: Partial<NewNotebookTemplate>,
) {
  const [updated] = await db
    .update(notebookTemplate)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(notebookTemplate.id, id), eq(notebookTemplate.userId, userId)),
    )
    .returning()
  return updated
}

export async function deleteNotebookTemplate(
  id: string,
  userId: string,
) {
  const [deleted] = await db
    .delete(notebookTemplate)
    .where(
      and(eq(notebookTemplate.id, id), eq(notebookTemplate.userId, userId)),
    )
    .returning()
  return !!deleted
}
