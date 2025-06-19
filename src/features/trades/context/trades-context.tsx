"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ITradeModel } from "../model/trades";

interface TradesContextType {
  isOpen: boolean;
  currentTrade: ITradeModel | null;
  setCurrentTrade: Dispatch<SetStateAction<ITradeModel | null>>;
}

const TradesContext = createContext<TradesContextType | null>(null);

export default function TradesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTrade, setCurrentTrade] = useState<ITradeModel | null>(null);

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
