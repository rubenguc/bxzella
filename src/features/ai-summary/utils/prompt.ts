import { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { AISummary } from "@/features/ai-summary/interfaces/ai-summary-interfaces";

export const system = `
  ### **Role**
  You are a professional technical trading analyst. Your job is to analyze trading performance reports and provide concise, professional, and actionable feedback for improvement.
  Focus on interpreting the data rather than repeating it. Use a clear and technically accurate tone suited for experienced or aspiring traders.

  ### **Instructions**
  1. Always start your response with **"Here's a technical analysis of your trading performance for the week:"**.
  2. Format the entire response using **Markdown syntax** with the following structure:
     - Use '#' for main headings (e.g., '## General Performance Overview').
     - Use '*' for bullet points (e.g., '* **Profit Factor:** ...').
     - Use '**bold**' for metric names (e.g., **Profit Factor**, **Win Rate**).
  3. Avoid using HTML tags; stick to Markdown syntax.
  `;

export function generateAISummaryPrompt(
  currentWeekData: TradeStatisticsResult,
  previousWeekData?: AISummary,
) {
  return previousWeekData
    ? getPromptWithComparison(currentWeekData, previousWeekData)
    : getPromptWithoutComparison(currentWeekData);
}

function getPromptWithoutComparison(currentWeekData: TradeStatisticsResult) {
  return `
  You are going to analyze a trader's performance for the current week and provide technical feedback that helps them improve.
  Your report must include:

  1. **General performance overview** — Was it a profitable or losing week?
  2. **Technical metric evaluation** — Net PnL, Profit Factor, Win Rate, Avg Win/Loss ratio.
  3. **Performance by trading pair** — For example, BTC-USDT, ETH-USDT. Ignore the -USDT suffix when generating the report.
  4. **Performance by trade type** — Long vs Short.
  5. **Suggestions for improvement** — Based on the data, give precise, actionable recommendations.

  Do not repeat the raw data. Focus on interpreting the trader’s behavior and outcomes. Keep your tone professional, direct, and useful for a trader seeking improvement.

  Here is the current week's data:

  \`\`\`json
  ${JSON.stringify(currentWeekData, null, 2)}
  \`\`\`
  `;
}

function getPromptWithComparison(
  currentWeekData: TradeStatisticsResult,
  previousWeekData: AISummary,
) {
  return `
  You are going to compare a trader's performance between this week and the previous week and provide a technical feedback report.

  Your analysis must include:

  1. **Overall performance change** — Did their results improve or decline?
  2. **Metric comparison** — Net PnL, Profit Factor, Win Rate, Avg Win/Loss ratio, etc.
  3. **Performance by trading pair** — For example, BTC-USDT, ETH-USDT. Ignore the -USDT suffix when generating the report.
  4. **Trade type performance** — Long vs Short.
  5. **Suggestions** — Highlight what improved, what got worse, and give specific, actionable recommendations.

  Interpret the data. Don't just list it. Be concise, professional, and use a tone appropriate for an experienced trader.

  Here is the data:

  **Current week:**
  \`\`\`json
  ${JSON.stringify(currentWeekData, null, 2)}
  \`\`\`

  **Previous week:**
  \`\`\`json
  ${JSON.stringify(previousWeekData, null, 2)}
  \`\`\`
  `;
}
