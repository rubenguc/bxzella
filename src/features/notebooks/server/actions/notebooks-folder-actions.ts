"use server";

import connectDB from "@/db/db";
import type { NotebookFolderForm } from "@/features/notebooks/interfaces/notebooks-folder-interfaces";
import {
  createNotebookFolder,
  deleteNotebookFolder,
  updateNotebookFolder,
} from "@/features/notebooks/server/db/notebooks-folder-db";
import { handleServerActionError } from "@/utils/server-api-utils";

export async function createNotebookFolderAction(
  data: NotebookFolderForm,
  accountId: string,
) {
  try {
    await connectDB();

    await createNotebookFolder({
      ...data,
      accountId,
      type: "session",
      isDefault: false,
    });

    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("error_creating_notebook_folder", error);
  }
}

export async function updateNotebookFolderAction(
  id: string,
  data: NotebookFolderForm,
) {
  try {
    await connectDB();
    const notebookFolder = await updateNotebookFolder(id, data);
    if (!notebookFolder) return handleServerActionError("notebook_not_found");
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("error_updating_notebook_folder", error);
  }
}

export async function deleteNotebookFolderAction(id: string) {
  try {
    await connectDB();
    const notebookFolder = await deleteNotebookFolder(id);
    if (!notebookFolder)
      return handleServerActionError("notebook_folder_not_found");
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("error_deleting_notebook_folder", error);
  }
}
