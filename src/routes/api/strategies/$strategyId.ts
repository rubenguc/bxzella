import { createFileRoute } from '@tanstack/react-router'

import { authMiddleware } from '#/lib/api-middleware'
import { apiHandler } from '#/lib/api-error'
import { getStrategyWithPlaybook } from '#/features/strategies/repository'

export const Route = createFileRoute('/api/strategies/$strategyId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: apiHandler('GET /api/strategies/:strategyId', async ({ params, context }) => {
        const session = (context as { session: { user: { id: string } } }).session
        const { strategyId } = params as { strategyId: string }

        const strategy = await getStrategyWithPlaybook(strategyId, session.user.id)
        if (!strategy) {
          return new Response(JSON.stringify({ error: 'not_found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify(strategy), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    },
  },
})