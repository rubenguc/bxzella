import { createMiddleware } from '@tanstack/react-start'
import { auth } from '#/lib/auth'
import { logger } from '#/lib/logger'

const log = logger.child({ name: 'auth-middleware' })

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user?.id) {
      log.warn({ pathname: request.url }, 'unauthenticated request rejected')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return next({ context: { session } })
  },
)
