"use server";

import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { handleServerActionError } from "@/utils/server-api-utils";
import { updateNotebookByTradeId } from "../db/notebooks-db";
import { getNotebookTradesFolderByAccountUID } from "../db/notebooks-folder-db";

export async function updateNotebookByTradeIdAction(
  tradeId: string,
  content: string,
  accountId: string,
) {
  try {
    await connectDB();

    const account = await getAccountById(accountId);

    const accountUID = account.uid;

    const notebookFolder =
      await getNotebookTradesFolderByAccountUID(accountUID);

    if (!notebookFolder) {
      return handleServerActionError("note_folder_id");
    }

    await updateNotebookByTradeId(tradeId, {
      content,
      folderId: notebookFolder._id,
    });
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("error_updating_notebook_trade", error);
  }
}
