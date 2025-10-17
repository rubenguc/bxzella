import type { NotebookFolderDocument } from "@/features/notebooks/interfaces/notebooks-folder-interfaces";
import type { Coin } from "@/global-interfaces";
import { baseConfig } from "@/services/api";

export async function getAllNotebooksFolders(params: {
  accountId: string;
  coin: Coin;
}): Promise<NotebookFolderDocument[]> {
  const response = await baseConfig.get("/notebooks-folder", { params });
  return response.data;
}
