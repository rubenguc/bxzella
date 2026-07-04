import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { getAccountsByUserId } from '#/features/exchange-accounts/db'
import { logger } from '#/lib/logger'

const log = logger.child({ name: 'api/accounts' })

export const Route = createFileRoute('/api/accounts')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context }) => {
        try {
          const session = (context as { session: { user: { id: string } } }).session
          const accounts = await getAccountsByUserId(session.user.id)

          return new Response(JSON.stringify(accounts), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          log.error({ err }, 'failed to fetch accounts')
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
