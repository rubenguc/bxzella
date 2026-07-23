import { z } from 'zod'
import { chat } from '@tanstack/ai'
import { geminiText } from '@tanstack/ai-gemini'
import { db } from '#/db/index'
import { trade } from '#/features/trades/schema'
import { notebook } from '#/features/notebooks/schema'
import { exchangeAccount } from '#/features/exchange-accounts/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { logger } from '#/lib/logger'
import { env } from '#/env'

const log = logger.child({ name: 'ai-agent' })

export const VERSION = '0.1'

// ── Structured output schema ──────────────────────────

export const weeklyAnalysisSchema = z.object({
  /** One or two sentence summary of the week */
  summary: z.string(),
  /** Overall assessment of trading performance */
  overallAssessment: z.string(),
  /** Key performance metrics */
  metrics: z.object({
    totalTrades: z.number(),
    winningTrades: z.number(),
    losingTrades: z.number(),
    winRate: z.number().min(0).max(100),
    totalPnl: z.string(),
    bestTrade: z.string(),
    worstTrade: z.string(),
  }),
  /** Recurring patterns observed across trades */
  patterns: z.array(
    z.object({
      pattern: z.string(),
      frequency: z.string(),
      impact: z.string(),
    }),
  ),
  /** Insights extracted from the user's notebook entries */
  notebookInsights: z.object({
    /** Whether the user had notebook entries this week */
    present: z.boolean(),
    /** Summary of what the user noted (empty string if no notebooks) */
    notesSummary: z.string(),
    /** Analysis of entry/exit reasoning, confluences, timing (empty string if no notebooks) */
    entryExitAnalysis: z.string(),
    /** Emotional or psychological observations (empty string if no notebooks) */
    psychologyNotes: z.string(),
    /** Observed confluences across multiple notes (empty if no notebooks) */
    confluences: z.array(z.string()),
  }),
  /** Actionable suggestions to improve trading */
  suggestions: z.array(z.string()),
})

export type WeeklyAnalysis = z.infer<typeof weeklyAnalysisSchema>

// ── System prompt ─────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert trading analyst and coach. Your role is to analyze a trader's weekly activity — their trades, positions, and personal notes — to help them improve their performance.

Analyze the following aspects:

1. **Trade Performance**: Review all closed positions from the week. Evaluate PnL, win rate, risk management (position sizing, leverage usage), and consistency. Identify which setups worked and which didn't.

2. **Notebook Analysis**: If the user has notebook entries, examine them carefully. Notebook content is unstructured — it may contain entry/exit reasoning, market observations, emotional states, confluence notes, timing decisions, strategy reflections, or anything else the user noted. Extract meaningful patterns:
   - **Timing**: Did the user enter/exit at optimal moments? Were entries based on technical confluences or impulsive decisions?
   - **Reasoning**: What rationale did they document for each trade? Is it consistent with a defined strategy?
   - **Confluences**: Are there recurring confluence factors the user considers (support/resistance, order flow, RSI, volume, price action, etc.)?
   - **Psychology**: What emotional patterns emerge (fear of missing out, revenge trading, overtrading after wins, hesitation)?
   - **Temporality**: Are trades clustered at specific times or days? Does the user trade better in certain market conditions?

3. **Pattern Recognition**: Identify behavioral and technical patterns that repeat across the week's data. Connect notebook observations with actual trade outcomes.

4. **Actionable Feedback**: Provide concrete, specific suggestions the trader can apply immediately. Focus on one or two key improvements rather than overwhelming them.

Write your analysis in English. Be direct and honest — the goal is growth, not flattery. When something is working well, say so. When something needs fixing, explain why and how.`;

// ── Query helpers ─────────────────────────────────────

function getCurrentWeekRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysSinceMonday)
  monday.setHours(0, 0, 0, 0)
  return { from: monday, to: now }
}

async function getTradesWithNotebooks(
  accountId: string,
  coin: 'USDT' | 'VST' | 'USDC',
  includeNotebook: boolean,
  timeframe: { from: Date; to: Date },
) {
  if (!includeNotebook) {
    return db
      .select()
      .from(trade)
      .where(
        and(
          eq(trade.accountId, accountId),
          eq(trade.coin, coin),
          gte(trade.updateTime, timeframe.from),
          lte(trade.updateTime, timeframe.to),
        ),
      )
      .orderBy(desc(trade.updateTime))
  }

  const rows = await db
    .select()
    .from(trade)
    .leftJoin(notebook, eq(trade.id, notebook.tradeId))
    .where(
      and(
        eq(trade.accountId, accountId),
        eq(trade.coin, coin),
        gte(trade.updateTime, timeframe.from),
        lte(trade.updateTime, timeframe.to),
      ),
    )
    .orderBy(desc(trade.updateTime))

  return rows.map((r) => ({ ...r.trade, notebook: r.notebook }))
}

async function getAccountInfo(accountId: string) {
  const [acc] = await db
    .select({ name: exchangeAccount.name, provider: exchangeAccount.provider })
    .from(exchangeAccount)
    .where(eq(exchangeAccount.id, accountId))
  return acc
}

// ── Format helpers ────────────────────────────────────

function formatTradesForPrompt(
  trades: Array<Record<string, unknown>>,
): string {
  return trades
    .map((t, i) => {
      const nb = (t as any).notebook
      const notebookSection = nb
        ? `\n  Notebook: ${(nb as any).contentPlainText || '(rich content)'}`
        : ''
      return `${i + 1}. Symbol: ${t.symbol} | Side: ${t.positionSide} | Entry: ${t.avgPrice} | Exit: ${t.avgClosePrice || 'open'} | PnL: ${t.realisedProfit} | Net: ${t.netProfit} | Leverage: ${t.leverage}x | Open: ${t.openTime} | Close: ${t.updateTime}${notebookSection}`
    })
    .join('\n')
}

// ── Agent entry point ─────────────────────────────────

export interface WeeklyFeedbackResult {
  analysis: WeeklyAnalysis | null
  version: string
  timeframe: { from: Date; to: Date }
}

export async function generateWeeklyFeedback(
  accountId: string,
  coin: 'USDT' | 'VST' | 'USDC',
  includeNotebook: boolean,
): Promise<WeeklyFeedbackResult> {
  const timeframe = getCurrentWeekRange()

  log.info({ accountId, coin, includeNotebook }, 'Consultando trades y cuenta')
  let account, trades
  try {
    ;[account, trades] = await Promise.all([
      getAccountInfo(accountId),
      getTradesWithNotebooks(accountId, coin, includeNotebook, timeframe),
    ])
  } catch (err) {
    log.error({ err, accountId, coin }, 'Error al consultar trades')
    throw err
  }

  if (trades.length === 0) {
    log.info({ accountId, coin }, 'No trades found for the week — skipping AI call')
    return { analysis: null, version: VERSION, timeframe }
  }

  const tradesFormatted = formatTradesForPrompt(trades as any[])
  const accountName = account?.name || accountId
  const provider = account?.provider || 'unknown'

  const userPrompt = `Analyze the following trading activity for the past week.

Account: ${accountName} (${provider})
Settlement Coin: ${coin}
Total Trades: ${trades.length}

Trades:
${tradesFormatted}

Provide a structured weekly analysis focusing on performance, patterns, notebook insights (if present), and actionable suggestions for improvement.`

  log.info({ accountId, coin, tradeCount: trades.length, model: env.GEMINI_MODEL }, 'Calling AI for weekly analysis')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = geminiText(env.GEMINI_MODEL as any)

  log.debug({ model: env.GEMINI_MODEL, tradeCount: trades.length }, 'Enviando prompt a Gemini')
  let result
  try {
    result = await chat({
      adapter,
      systemPrompts: [{ content: SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: userPrompt }],
      outputSchema: weeklyAnalysisSchema,
    })
  } catch (err) {
    log.error({ err, model: env.GEMINI_MODEL }, 'Error en llamada a Gemini')
    throw err
  }

  log.info({ accountId, coin, summary: result.summary?.slice(0, 100) }, 'Análisis generado exitosamente')

  return { analysis: result, version: VERSION, timeframe }
}
