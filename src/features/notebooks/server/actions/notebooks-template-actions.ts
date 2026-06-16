"use server";

import connectDB from "@/db/db";
import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";
import type { NotebooksTemplateForm } from "../../schemas/notebooks-template-schema";
import {
  createNotebookTemplate,
  deleteNotebookTemplate,
  updateNotebookTemplate,
} from "../db/notebooks-template-db";

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

export async function createNotebookTemplateAction(
  data: NotebooksTemplateForm,
) {
  try {
    const userId = await getUserAuth();
    await connectDB();

    const contentPlainText = extractPlainTextFromLexicalContent(data.content);

    await createNotebookTemplate({ ...data, contentPlainText, userId });
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("error_creating_notebook_template", error);
  }
}

export async function updateNotebookTemplateAction(
  id: string,
  data: NotebooksTemplateForm,
) {
  try {
    await connectDB();

    const contentPlainText = extractPlainTextFromLexicalContent(data.content);

    const notebookTemplate = await updateNotebookTemplate(id, {
      ...data,
      contentPlainText,
    });
    if (!notebookTemplate)
      return handleServerActionError("notebook_template_not_found");
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("error_updating_notebook_template", error);
  }
}

export async function deleteNotebookTemplateAction(id: string) {
  try {
    await connectDB();
    const notebookTemplate = await deleteNotebookTemplate(id);
    if (!notebookTemplate)
      return handleServerActionError("notebook_template_not_found");
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("error_deleting_notebook_template", error);
  }
}
