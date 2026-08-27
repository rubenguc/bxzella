import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { getStrategiesByUserId } from '#/features/strategies/repository'

export const Route = createFileRoute('/api/strategies/options')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/strategies/options', async ({ context }) => {
        const session = (context as { session: { user: { id: string } } }).session
        const strategies = await getStrategiesByUserId(session.user.id)

        return new Response(JSON.stringify(strategies), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})