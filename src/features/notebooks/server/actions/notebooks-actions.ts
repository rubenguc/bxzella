"use server";

import connectDB from "@/db/db";
import type { Coin } from "@/interfaces/global-interfaces";
import { handleServerActionError } from "@/utils/server-api-utils";
import { transformDocument } from "@/utils/mongoose-utils";
import {
  getNotebookByTradeId,
  updateNotebookByTradeId,
} from "../db/notebooks-db";
import { getNotebookTradesFolderByAccountId } from "../db/notebooks-folder-db";

function extractPlainTextFromLexicalContent(lexicalContent: string): string {
  try {
    const parsed = JSON.parse(lexicalContent);
    const root = parsed.root;

    function extractText(node: any): string {
      if (!node) return "";

      if (node.children) {
        return node.children.map(extractText).filter(Boolean).join(" ");
      }

      if (node.text) {
        return node.text;
      }

      return "";
    }

    return extractText(root).trim();
  } catch {
    return "";
  }
}

export async function updateNotebookByTradeIdAction(
  tradeId: string,
  content: string,
  accountId: string,
  coin: Coin,
) {
  try {
    await connectDB();

    const notebookFolder = await getNotebookTradesFolderByAccountId(accountId);

    if (!notebookFolder) {
      return handleServerActionError("note_folder_id_not_found");
    }

    const contentPlainText = extractPlainTextFromLexicalContent(content);

    const updatedNotebook = await updateNotebookByTradeId(tradeId, {
      content,
      contentPlainText,
      coin,
      folderId: notebookFolder._id,
    });

    // Convert Mongoose document to plain JSON object with stringified IDs
    return {
      error: false,
      message: "",
      data: transformDocument(updatedNotebook),
    };
  } catch (error) {
    return handleServerActionError("error_updating_notebook_trade", error);
  }
}
