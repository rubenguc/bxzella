"use server";

import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";
import { TradePlaybook } from "../../interfaces/trades-interfaces";
import { updateTradePlaybook } from "../db/trades-db";
import connectDB from "@/db/db";

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
