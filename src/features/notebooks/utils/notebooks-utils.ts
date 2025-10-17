import { transformTimeToLocalDate } from "@/utils/date-utils";
import { transformSymbol } from "@/utils/trade-utils";
import type { NotebookDocumentWithTrade } from "../interfaces/notebooks-interfaces";

export const getNotebookTitle = (notebook: NotebookDocumentWithTrade) => {
  const isNotebookTrade = notebook.tradeId !== null;

  if (isNotebookTrade)
    return `${transformSymbol(notebook.tradeId!.symbol)}: ${transformTimeToLocalDate(notebook.tradeId!.updateTime)}`;
};
