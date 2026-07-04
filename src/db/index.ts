import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema.ts'
import * as exchangeAccountsSchema from '#/features/exchange-accounts/schema'

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...schema, ...exchangeAccountsSchema },
})
