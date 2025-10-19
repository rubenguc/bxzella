import type { Types } from "mongoose";

export interface NotebookFolderForm {
  name: string;
  tagColor: string;
}

export interface NotebookFolder extends NotebookFolderForm {
  type: "trade" | "day" | "session" | "note";
  isDefault: boolean;
  accountId: Types.ObjectId | string | null;
}

export interface NotebookFolderDocument extends NotebookFolder {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
