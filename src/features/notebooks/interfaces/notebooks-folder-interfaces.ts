export interface NotebookFolderForm {
  name: string;
  tagColor: string;
}

export interface NotebookFolder extends NotebookFolderForm {
  type: "trade" | "day" | "session" | "note";
  isDefault: boolean;
  accountUID: string;
}

export interface NotebookFolderDocument extends NotebookFolder {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
