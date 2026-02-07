"use server";

import connectDB from "@/db/db";
import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";
import {
  getPlaybookTradeProgressWithPlaybook,
  upsertPlaybookTradeProgress,
} from "../db/playbook-trade-progress-db";
import type { UpdatePlaybookTradeProgressProps } from "../interfaces/playbook-trade-progress-interfaces";

export async function updatePlaybookTradeProgressAction(
  props: UpdatePlaybookTradeProgressProps,
) {
  try {
    await getUserAuth();
    await connectDB();
    const result = await upsertPlaybookTradeProgress(props);
    const isUpdated = !!result;
    return { error: false, message: "", isUpdated };
  } catch (error) {
    return handleServerActionError(
      "failed_to_update_playbook_trade_progress",
      error,
    );
  }
}

export async function getPlaybookTradeProgressWithPlaybookAction(
  tradeId: string,
) {
  try {
    await getUserAuth();
    await connectDB();
    const result = await getPlaybookTradeProgressWithPlaybook(tradeId);
    return { error: false, message: "", data: result };
  } catch (error) {
    return handleServerActionError(
      "failed_to_get_playbook_trade_progress",
      error,
    );
  }
}
