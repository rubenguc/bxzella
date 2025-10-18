"use client";

import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";

interface TradesContextType {
  isOpen: boolean;
  currentTrade: TradeDocument | null;
  setCurrentTrade: Dispatch<SetStateAction<TradeDocument | null>>;
}

const TradesContext = createContext<TradesContextType | null>(null);

export default function TradesProvider({ children }: PropsWithChildren) {
  const [currentTrade, setCurrentTrade] = useState<TradeDocument | null>(null);

  const isOpen = !!currentTrade;

  return (
    <TradesContext.Provider value={{ isOpen, currentTrade, setCurrentTrade }}>
      {children}
    </TradesContext.Provider>
  );
}

export const useTradeContext = () => {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error("useTradeContext must be used within a TradeProvider");
  }
  return context;
};
