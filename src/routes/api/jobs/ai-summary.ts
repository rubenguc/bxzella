import { createFileRoute } from '@tanstack/react-router'
import { serve } from '@upstash/workflow/tanstack'
import { generateWeeklyFeedback } from '#/features/ai-summary-subscriptions/ai-agent'
import { upsertAnalysis } from '#/features/ai-summary-analyses/repository'
import { logger } from '#/lib/logger'

const log = logger.child({ name: 'jobs/ai-summary' })

export const Route = createFileRoute('/api/jobs/ai-summary')({
  server: {
    handlers: serve<{
      id: string
      accountId: string
      coin: 'USDT' | 'VST' | 'USDC'
      includeNotebook: boolean
    }>(async (context) => {
      const { id, accountId, coin, includeNotebook } = context.requestPayload

      log.info({ subscriptionId: id, accountId, coin, includeNotebook }, 'Job iniciado')

      const feedback = await context.run('generate-ai-feedback', async () => {
        log.info({ accountId, coin }, 'Generando feedback semanal')
        let analysis
        try {
          analysis = await generateWeeklyFeedback(
            accountId,
            coin,
            includeNotebook,
          )
        } catch (err) {
          log.error({ err, accountId, coin }, 'Error al generar feedback')
          throw err
        }

        log.info({ subscriptionId: id, version: analysis.version, timeframe: analysis.timeframe, analysis: analysis.analysis }, 'Feedback generado')

        try {
          const saved = await upsertAnalysis({
            subscriptionId: id,
            weekStart: analysis.timeframe.from,
            weekEnd: analysis.timeframe.to,
            version: analysis.version,
            analysis: analysis.analysis,
          })
          log.info({ subscriptionId: id, analysisId: saved.id }, 'Análisis guardado en DB')
        } catch (err) {
          log.error({ err, subscriptionId: id }, 'Error al guardar análisis en DB')
          throw err
        }

        return analysis
      })

      log.info({ subscriptionId: id }, 'Job completado exitosamente')
      return { success: true, id, accountId, coin, includeNotebook, feedback }
    }),
  },
})
