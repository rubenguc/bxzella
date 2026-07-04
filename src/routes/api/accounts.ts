import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { getAccountsByUserId } from '#/features/exchange-accounts/db'

export const Route = createFileRoute('/api/accounts')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context }) => {
        const session = (context as { session: { user: { id: string } } }).session
        const accounts = await getAccountsByUserId(session.user.id)

        return new Response(JSON.stringify(accounts), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
