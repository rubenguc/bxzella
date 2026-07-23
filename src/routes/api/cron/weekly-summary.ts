import { createFileRoute } from '@tanstack/react-router'
import { Client } from '@upstash/workflow'
import { db } from '#/db/index'
import { aiSummarySubscription } from '#/features/ai-summary-subscriptions/schema'
import { eq } from 'drizzle-orm'
import { logger } from '#/lib/logger'
import { env } from '#/env'

const log = logger.child({ name: 'cron/weekly-summary' })

export const Route = createFileRoute('/api/cron/weekly-summary')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        log.info('Cron iniciado')

        const secret = env.CRON_SECRET
        if (secret) {
          const authHeader = request.headers.get('authorization')
          if (authHeader !== `Bearer ${secret}`) {
            log.warn({ authHeader }, 'CRON_SECRET inválido')
            return new Response('Unauthorized', { status: 401 })
          }
          log.debug('CRON_SECRET validado')
        } else if (process.env.NODE_ENV !== 'development') {
          log.error('CRON_SECRET no está configurado')
          return new Response('Unauthorized', { status: 401 })
        } else {
          log.warn('CRON_SECRET no configurado — saltando validación en desarrollo')
        }

        const client = new Client({
          token: env.QSTASH_TOKEN,
          baseUrl: env.QSTASH_URL,
        })

        const BASE_URL = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000'

        log.debug({ baseUrl: BASE_URL }, 'BASE_URL resuelta')

        // Consultar suscripciones activas
        log.info('Consultando suscripciones activas')
        let activeSubscriptions
        try {
          activeSubscriptions = await db
            .select({
              id: aiSummarySubscription.id,
              accountId: aiSummarySubscription.accountId,
              coin: aiSummarySubscription.coin,
              includeNotebook: aiSummarySubscription.includeNotebook,
            })
            .from(aiSummarySubscription)
            .where(eq(aiSummarySubscription.isActive, true))
        } catch (err) {
          log.error({ err }, 'Error al consultar suscripciones')
          return new Response('Internal Server Error', { status: 500 })
        }

        log.info({ total: activeSubscriptions.length }, 'Suscripciones encontradas')

        if (activeSubscriptions.length === 0) {
          return Response.json({
            status: 'No active subscriptions',
            total: 0,
          })
        }

        // Encolar un workflow por cada suscripción activa
        log.info({ total: activeSubscriptions.length }, 'Encolando workflows')
        const isDevelop =
          process.env.VERCEL_GIT_COMMIT_REF === 'develop' ||
          process.env.NODE_ENV === 'development'

        const triggerPromises = activeSubscriptions.map((sub) =>
          client.trigger({
            url: `${BASE_URL}/api/jobs/ai-summary`,
            body: {
              id: sub.id,
              accountId: sub.accountId,
              coin: sub.coin,
              includeNotebook: sub.includeNotebook,
            },
            headers: !isDevelop && process.env.VERCEL_AUTOMATION_BYPASS_SECRET
              ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
              : undefined,
            retries: 3,
          }),
        )

        const results = await Promise.allSettled(triggerPromises)

        const succeeded = results.filter(
          (r) => r.status === 'fulfilled',
        ).length
        const failed = results.filter((r) => r.status === 'rejected').length

        if (failed > 0) {
          log.error({ succeeded, failed, errors: results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult)) }, 'Algunos workflows fallaron')
        } else {
          log.info({ succeeded }, 'Workflows encolados correctamente')
        }

        return Response.json({
          status: 'Queued',
          total: activeSubscriptions.length,
          succeeded,
          failed,
        })
      },
    },
  },
})
