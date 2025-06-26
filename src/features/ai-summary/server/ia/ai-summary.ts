import {
  AISummary,
  AISummaryWeekSummary,
} from "@/features/ai-summary/interfaces/ai-summary-interfaces";
import {
  generateAISummaryPrompt,
  system,
} from "@/features/ai-summary/utils/prompt";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function getAISummaryResult(
  currentWeekData: AISummaryWeekSummary,
  previousWeekData?: AISummary,
) {
  const prompt = generateAISummaryPrompt(currentWeekData, previousWeekData);

  const { text } = await generateText({
    model: google(process.env.AI_MODEL as string),
    system,
    prompt: prompt,
  });

  return text;
}
