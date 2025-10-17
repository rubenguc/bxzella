"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import type { NotebookFolderDocument } from "../interfaces/notebooks-folder-interfaces";

type DialogType = "add" | "edit" | "delete";

interface NotebookFoldersContextType {
  selectedNotebookFolder: NotebookFolderDocument | null;
  setSelectedNotebookFolder: Dispatch<
    SetStateAction<NotebookFolderDocument | null>
  >;
  open: DialogType | null;
  setOpen: Dispatch<SetStateAction<DialogType | null>>;

  selectedNotebookFolderAction: NotebookFolderDocument | null;
  setSelectedNotebookFolderAction: Dispatch<
    SetStateAction<NotebookFolderDocument | null>
  >;
}

const NotebookFoldersContext = createContext<NotebookFoldersContextType | null>(
  null,
);

export function NotebookFoldersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<DialogType | null>(null);
  const [selectedNotebookFolder, setSelectedNotebookFolder] =
    useState<NotebookFolderDocument | null>(null);

  const [selectedNotebookFolderAction, setSelectedNotebookFolderAction] =
    useState<NotebookFolderDocument | null>(null);

  return (
    <NotebookFoldersContext.Provider
      value={{
        selectedNotebookFolder,
        setSelectedNotebookFolder,
        open,
        setOpen,
        selectedNotebookFolderAction,
        setSelectedNotebookFolderAction,
      }}
    >
      {children}
    </NotebookFoldersContext.Provider>
  );
}

export function useNotebookFoldersContext() {
  const context = useContext(NotebookFoldersContext);
  if (!context) {
    throw new Error(
      "useNotebooksContext must be used within a NotebooksProvider",
    );
  }
  return context;
}
