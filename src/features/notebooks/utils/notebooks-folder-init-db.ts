import type { NotebookFolder } from "../interfaces/notebooks-folder-interfaces";

export const DEFAULT_FOLDER_NAMES = {
  TRADE_NOTES: "trade_notes",
  DAILY_JOURNAL: "daily_journal",
  SESSIONS_RECAP: "sessions_recap",
};

export const getDefaultFolderNames = (): string[] =>
  Object.values(DEFAULT_FOLDER_NAMES);

export const getDefaultNotebookFolders = (
  accountUID: string,
): Partial<NotebookFolder>[] => [
  {
    name: DEFAULT_FOLDER_NAMES.TRADE_NOTES,
    tagColor: "system",
    type: "trade",
    isDefault: true,
    accountUID,
  },
  {
    name: DEFAULT_FOLDER_NAMES.DAILY_JOURNAL,
    tagColor: "system",
    type: "day",
    isDefault: true,
    accountUID,
  },
  {
    name: DEFAULT_FOLDER_NAMES.SESSIONS_RECAP,
    tagColor: "system",
    type: "day",
    isDefault: true,
    accountUID,
  },
];
