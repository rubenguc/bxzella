"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { AISummaryDocument } from "@/features/ai-summary/interfaces/ai-summary-interfaces";

interface AISummaryContextType {
  isOpen: boolean;
  currentAISummary: AISummaryDocument | null;
  setCurrentAISummary: Dispatch<SetStateAction<AISummaryDocument | null>>;
}

const AISummaryContext = createContext<AISummaryContextType | null>(null);

export default function AISummaryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentAISummary, setCurrentAISummary] =
    useState<AISummaryDocument | null>(null);

  const isOpen = !!currentAISummary;

  return (
    <AISummaryContext.Provider
      value={{ isOpen, currentAISummary, setCurrentAISummary }}
    >
      {children}
    </AISummaryContext.Provider>
  );
}

export const useAISummaryContext = () => {
  const context = useContext(AISummaryContext);
  if (!context) {
    throw new Error(
      "useAISummaryContext must be used within a AISummaryProvider",
    );
  }
  return context;
};
