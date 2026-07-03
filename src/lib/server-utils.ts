import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '../db/index'
import { user } from '../db/schema'

export const checkAdminExists = createServerFn().handler(async () => {
  const [admin] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, 'admin'))
    .limit(1)

  return { exists: !!admin }
})
