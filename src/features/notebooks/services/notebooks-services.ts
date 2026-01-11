import type { Coin, PaginationResponse } from "@/interfaces/global-interfaces";
import { baseConfig } from "@/services/api";
import type {
  NotebookDocument,
  NotebookDocumentWithTrade,
} from "../interfaces/notebooks-interfaces";

export async function getNotebooksByFolderId(
  folderId: string | null,
  params: {
    page: number;
    limit: number;
    coin: Coin;
  },
): Promise<PaginationResponse<NotebookDocumentWithTrade>> {
  const response = await baseConfig.get(`/notebooks/folder/${folderId || -1}`, {
    params,
  });
  return response.data;
}

export async function getNotebookByTradeId(
  tradeId: string,
): Promise<NotebookDocument> {
  const response = await baseConfig.get(`/notebooks/trade/${tradeId}`);
  return response.data;
}
