import pino from 'pino'

const isServer = typeof window === 'undefined'

interface NodeModuleApi {
  createRequire: (path: string | URL) => { resolve: (id: string) => string }
}

/**
 * Vite's dev SSR module runner has no real file path on the stack, so pino cannot
 * resolve a bare transport target, and it rejects `import.meta.resolve`. Resolve
 * the target ourselves through Node's own module loader instead.
 *
 * Client components reach this module transitively through server-action imports,
 * so no `node:*` import may appear here: Vite hoists CJS interop property access
 * to module scope, which throws in the browser before any runtime guard can run.
 * `process.getBuiltinModule` is only reached on the server.
 */
function resolvePinoPretty(): string {
  const nodeModule = (
    process as unknown as {
      getBuiltinModule?: (id: string) => NodeModuleApi | undefined
    }
  ).getBuiltinModule?.('node:module')

  if (!nodeModule) return 'pino-pretty'

  return nodeModule.createRequire(import.meta.url).resolve('pino-pretty')
}

function devTransport() {
  if (!isServer) return {}
  if (process.env.NODE_ENV === 'production') return {}

  return {
    transport: {
      target: resolvePinoPretty(),
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    },
  }
}

export const logger = pino({
  name: 'bxzella',
  level: (isServer ? process.env.LOG_LEVEL : undefined) ?? 'debug',
  ...devTransport(),
})
