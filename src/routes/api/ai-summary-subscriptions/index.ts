import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { getSubscriptionsByUserId } from '#/features/ai-summary-subscriptions/repository'

export const Route = createFileRoute('/api/ai-summary-subscriptions/')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/ai-summary-subscriptions', async ({ context }) => {
        const session = (context as { session: { user: { id: string } } }).session
        const subscriptions = await getSubscriptionsByUserId(session.user.id)

        return new Response(JSON.stringify(subscriptions), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})
