/**
 * Standardized server action result.
 *
 * Usage:
 *   const result = await createSomething({ data: ... })
 *   if (!result.success) return setError(result.error)
 *   // result.data is typed
 */
import { logger } from '#/lib/logger'

const log = logger.child({ name: 'server-action' })

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Wraps a server action handler with consistent error handling.
 * - Known errors: throw `new Error('message_key')` in the handler
 * - Unexpected errors: automatically caught and reported as `'server_error'`
 *
 * @param fn — the handler logic
 * @param errorMap — optional map from thrown message to user-facing key
 */
export async function wrapAction<T>(
  fn: () => Promise<T>,
  errorMap?: Record<string, string>,
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'server_error'
    const error = errorMap?.[message] ?? message

    log.error({ err, error: message }, 'server action failed')

    return { success: false, error }
  }
}
