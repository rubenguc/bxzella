import { tool } from "ai";
import { z } from "zod";
import { analyzeTradePnL, getNotebooks, getTrades } from "./trading-tools";
import type { Coin } from "@/interfaces/global-interfaces";
import { getDateRange } from "./date-ranges";

function getCurrentMonthDateRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  return {
    startDate: startOfMonth.toISOString().split("T")[0],
    endDate: endOfMonth.toISOString().split("T")[0],
  };
}

function parseDateRange(
  startDate?: string,
  endDate?: string,
): { startDate: string; endDate: string } {
  // If dates are provided by the model, use them
  if (startDate && endDate) {
    return { startDate, endDate };
  }

  // Check for special range keywords in startDate field
  if (startDate) {
    const rangeKeywords = [
      "today",
      "this-week",
      "last-week",
      "this-month",
      "last-month",
      "last-30-days",
    ];
    if (rangeKeywords.includes(startDate)) {
      return getDateRange(startDate);
    }
  }

  // Default to current month
  return getCurrentMonthDateRange();
}

interface CreateToolsOptions {
  accountId: string;
  coin: Coin;
  timezone: number;
}

export function createChatTools({
  accountId,
  coin,
  timezone,
}: CreateToolsOptions) {
  return {
    getTrades: tool({
      description:
        "Fetch trade records for the user's account. Use this when you need trade data without notebook content.",
      inputSchema: z.object({
        page: z.number().optional().default(0),
        limit: z.number().optional().default(20),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
      execute: async ({ page, limit, startDate, endDate }) => {
        const dateRange = parseDateRange(startDate, endDate);

        return getTrades({
          accountId,
          coin,
          page,
          limit,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          timezone,
        });
      },
    }),
    getNotebooks: tool({
      description:
        "Fetch notebook entries (notes/analysis) for trades. Use this to get user's trade notes.",
      inputSchema: z.object({
        tradeId: z.string().optional(),
        folderId: z.string().optional(),
        page: z.number().optional().default(0),
        limit: z.number().optional().default(20),
      }),
      execute: async ({ tradeId, folderId, page, limit }) => {
        const notebooks = await getNotebooks({
          accountId,
          coin,
          tradeId,
          folderId,
          page,
          limit,
        });
        console.log(notebooks.data);
        return notebooks.data;
      },
    }),
    analyzeTradePnL: tool({
      description:
        "Main tool for P&L analysis. Fetches trades with their associated notebook content (contentPlainText) for comprehensive analysis. Returns netProfit, positionSide, leverage, and notebook notes.",
      inputSchema: z.object({
        page: z.number().optional().default(0),
        limit: z.number().optional().default(50),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
      execute: async ({ page, limit, startDate, endDate }) => {
        const dateRange = parseDateRange(startDate, endDate);

        return analyzeTradePnL({
          accountId,
          coin,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page,
          limit,
          timezone,
        });
      },
    }),
  };
}
