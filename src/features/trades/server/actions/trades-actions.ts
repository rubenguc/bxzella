"use server";

import connectDB from "@/db/db";
import type { TradePlaybook } from "@/features/trades/interfaces/trades-interfaces";
import { updateTradePlaybook } from "@/features/trades/server/db/trades-db";
import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";

export async function updateTradePlaybookAction(
  tradeId: string,
  tradePlaybook: TradePlaybook,
) {
  try {
    await getUserAuth();
    await connectDB();
    const result = await updateTradePlaybook(tradeId, tradePlaybook);
    const isUpdated = result.matchedCount === 1;
    return { error: false, message: "", isUpdated };
  } catch (error) {
    return handleServerActionError("failed_to_create_playbook", error);
  }
}
