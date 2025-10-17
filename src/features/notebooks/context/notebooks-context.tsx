"use client";

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import type { NotebookDocumentWithTrade } from "../interfaces/notebooks-interfaces";

interface NotebooksContextType {
  selectedNotebook: NotebookDocumentWithTrade | null;
  setSelectedNotebook: Dispatch<
    SetStateAction<NotebookDocumentWithTrade | null>
  >;
}

const NotebooksContext = createContext<NotebooksContextType | null>(null);

export function NotebooksProvider({ children }: { children: React.ReactNode }) {
  const [selectedNotebook, setSelectedNotebook] =
    useState<NotebookDocumentWithTrade | null>(null);

  return (
    <NotebooksContext.Provider
      value={{
        selectedNotebook,
        setSelectedNotebook,
      }}
    >
      {children}
    </NotebooksContext.Provider>
  );
}

export function useNotebooksContext() {
  const context = useContext(NotebooksContext);
  if (!context) {
    throw new Error(
      "useNotebooksContext must be used within a NotebooksProvider",
    );
  }
  return context;
}
