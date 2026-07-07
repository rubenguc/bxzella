import { ZodError } from 'zod'
import { logger } from '#/lib/logger'

const log = logger.child({ name: 'api-error' })

function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError
}

/**
 * Wraps an API route handler with consistent error handling.
 *
 * Usage:
 * ```ts
 * export const Route = createFileRoute('/api/accounts')({
 *   server: {
 *     middleware: [authMiddleware],
 *     handlers: {
 *       GET: apiHandler('GET /api/accounts', async ({ context }) => { ... }),
 *     },
 *   },
 * })
 * ```
 */
export function apiHandler(
  label: string,
  fn: (ctx: any) => Response | Promise<Response>,
): (ctx: any) => Promise<Response> {
  return async (ctx: any) => {
    try {
      return await fn(ctx)
    } catch (err) {
      if (isZodError(err)) {
        log.warn({ err, label }, 'api validation error')
        return new Response(
          JSON.stringify({ error: 'validation_error', details: err.issues }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }

      log.error({ err, label }, 'api handler failed')
      return new Response(JSON.stringify({ error: 'server_error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

/**
 * Direct error response for when you need the raw Response without a handler wrapper.
 */
export function apiError(err: unknown, label?: string): Response {
  log.error({ err, label }, 'api error')
  return new Response(JSON.stringify({ error: 'server_error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}
