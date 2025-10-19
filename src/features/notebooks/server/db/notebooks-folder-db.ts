import type {
  NotebookFolder,
  NotebookFolderDocument,
} from "@/features/notebooks/interfaces/notebooks-folder-interfaces";
import { NotebookFolderModel } from "@/features/notebooks/model/notebooks-folder-model";
import {
  getDefaultFolderNames,
  getDefaultNotebookFolders,
} from "@/features/notebooks/utils/notebooks-folder-init-db";

export async function createNotebookFolder(
  data: NotebookFolder,
): Promise<NotebookFolderDocument> {
  const newFolder = new NotebookFolderModel(data);
  return await newFolder.save();
}

export async function getAllNotebooksFolders({
  accountId,
}: {
  accountId: string;
}): Promise<NotebookFolderDocument[]> {
  return await NotebookFolderModel.find({ accountId }).sort({
    isDefault: -1,
    _id: 1,
  });
}

export async function updateNotebookFolder(
  id: string,
  data: Partial<NotebookFolder>,
): Promise<NotebookFolderDocument | null> {
  return await NotebookFolderModel.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteNotebookFolder(id: string): Promise<boolean> {
  const result = await NotebookFolderModel.deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function getNotebookTradesFolderByAccountId(accountId: string) {
  return await NotebookFolderModel.findOne({ accountId, name: "trade_notes" });
}

export async function initializeNotebooksFolder(
  accountId: string,
): Promise<void> {
  try {
    const existingCount = await NotebookFolderModel.countDocuments({
      name: { $in: getDefaultFolderNames() },
      accountId,
    });

    if (existingCount === 0) {
      console.log("Insertando notebooks folders iniciales...");
      await NotebookFolderModel.insertMany(
        getDefaultNotebookFolders(accountId),
      );
      console.log("Notebooks iniciales insertados correctamente.");
    } else {
      console.log(`Ya existen ${existingCount} notebooks iniciales.`);
    }
  } catch (error) {
    console.error("Error initializing notebooks folder: #error", error);
  }
}
