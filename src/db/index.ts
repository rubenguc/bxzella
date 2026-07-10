import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema.ts'
import * as exchangeAccountsSchema from '#/features/exchange-accounts/schema'
import * as tradesSchema from '#/features/trades/schema'
import * as notebooksSchema from '#/features/notebooks/schema'
import * as notebooksTemplatesSchema from '#/features/notebooks-templates/schema'

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...schema, ...exchangeAccountsSchema, ...tradesSchema, ...notebooksSchema, ...notebooksTemplatesSchema },
})
