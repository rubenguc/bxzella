"use server";

import connectDB from "@/db/db";
import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";
import type { NotebooksTemplateForm } from "../../schemas/notebooks-template-schema";
import {
  createNotebookTemplate,
  deleteNotebookTemplate,
  updateNotebookTemplate,
} from "../db/notebooks-template-db";

export async function createNotebookTemplateAction(
  data: NotebooksTemplateForm,
) {
  try {
    const userId = await getUserAuth();
    await connectDB();
    await createNotebookTemplate({ ...data, userId });
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
    const notebookTemplate = await updateNotebookTemplate(id, data);
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
