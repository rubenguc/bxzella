import { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import type { Types } from "mongoose";

export interface Notebook {
  startDate?: Date;
  endDate?: Date;
  tradeId?: string;
  content: string;
  title: string;
  folderId: Types.ObjectId | string | null;
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
