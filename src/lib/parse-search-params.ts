import { z } from 'zod'

/**
 * Parses URL search params against a Zod schema.
 * Throws ZodError if validation fails (caught by apiHandler).
 */
export function parseSearchParams<T extends z.ZodSchema>(
  request: Request,
  schema: T,
): z.infer<T> {
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())
  return schema.parse(searchParams)
}
