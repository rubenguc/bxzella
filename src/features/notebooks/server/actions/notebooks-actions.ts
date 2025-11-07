"use server";

import connectDB from "@/db/db";
import { handleServerActionError } from "@/utils/server-api-utils";
import { updateNotebookByTradeId } from "../db/notebooks-db";
import { getNotebookTradesFolderByAccountId } from "../db/notebooks-folder-db";

export async function updateNotebookByTradeIdAction(
  tradeId: string,
  content: string,
  accountId: string,
) {
  try {
    await connectDB();

    const notebookFolder = await getNotebookTradesFolderByAccountId(accountId);

    if (!notebookFolder) {
      return handleServerActionError("note_folder_id_not_found");
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
