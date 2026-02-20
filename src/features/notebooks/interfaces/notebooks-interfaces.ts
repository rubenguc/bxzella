import type { Types } from "mongoose";
import type { Coin } from "@/interfaces/global-interfaces";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";

export interface Notebook {
  startDate?: Date;
  endDate?: Date;
  tradeId?: string;
  content: string;
  contentPlainText: string;
  title: string;
  folderId: Types.ObjectId | string | null;
  coin: Coin;
}

export interface NotebookDocument extends Notebook {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotebookDocumentWithTrade
  extends Omit<NotebookDocument, "tradeId"> {
  tradeId: TradeDocument | null;
}
