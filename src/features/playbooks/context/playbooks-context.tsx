import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import type { PlaybookDocument } from "../interfaces/playbooks-interfaces";

type PlaybooksDialogType = "add" | "edit" | "delete";

interface PlaybooksContextType {
  open: PlaybooksDialogType | null;
  setOpen: (str: PlaybooksDialogType | null) => void;
  currentRow: PlaybookDocument | null;
  setCurrentRow: Dispatch<SetStateAction<PlaybookDocument | null>>;
}

const PlaybooksContext = createContext<PlaybooksContextType | null>(null);

export default function PlaybooksProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState<PlaybooksDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<PlaybookDocument | null>(null);

  return (
    <PlaybooksContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </PlaybooksContext.Provider>
  );
}

export const usePlaybooks = () => {
  const playbooksContext = useContext(PlaybooksContext);

  if (!playbooksContext) {
    throw new Error("usePlaybooks has to be used within <PlaybooksContext>");
  }

  return playbooksContext;
};
