"use server";

import { handleServerActionError } from "@/utils/server-api-utils";
import { TradePlaybook } from "../../interfaces/trades-interfaces";
import { auth } from "@clerk/nextjs/server";
import { updateTradePlaybook } from "../db/trades-db";

export async function updateTradePlaybookAction(
  tradeId: string,
  tradePlaybook: TradePlaybook,
) {
  try {
    const { userId } = await auth();

    if (userId === null) return handleServerActionError("not_authenticated");

    const result = await updateTradePlaybook(tradeId, tradePlaybook);
    return { error: false, message: "", result };
  } catch (error) {
    console.error("Error updating playbook:", error);
    return handleServerActionError("failed_to_create_playbook");
  }
}
