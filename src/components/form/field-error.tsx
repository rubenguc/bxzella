/**
 * Normalize an unknown error value to a displayable string.
 * Handles strings, objects with `message`, and nested arrays.
 */
export function toError(err: unknown): string | undefined {
  if (!err) return undefined
  if (typeof err === 'string') return err
  if (Array.isArray(err)) {
    return err.map(toError).filter(Boolean).join(', ')
  }
  if (typeof err === 'object' && err !== null) {
    if ('message' in err) return String((err as { message: string }).message)
    if ('error' in err) return toError((err as { error: unknown }).error)
  }
  return String(err)
}

export function FieldError({ error }: { error: unknown }) {
  const msg = toError(error)
  if (!msg) return null
  return <p className="text-sm text-destructive mt-1">{msg}</p>
}
