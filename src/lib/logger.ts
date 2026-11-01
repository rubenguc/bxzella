import { createRequire } from 'node:module'
import pino from 'pino'

const require = createRequire(import.meta.url)

export const logger = pino({
  name: 'bxzella',
  level: process.env.LOG_LEVEL ?? 'debug',
  ...(process.env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: require.resolve('pino-pretty'),
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
})
