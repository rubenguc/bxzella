import type {
  Notebook,
  NotebookDocument,
} from "@/features/notebooks/interfaces/notebooks-interfaces";
import { NotebooksModel } from "@/features/notebooks/model/notebooks-model";
import type { Coin } from "@/interfaces/global-interfaces";

export async function createNotebook(
  data: Notebook,
): Promise<NotebookDocument> {
  const newNotebook = new NotebooksModel(data);
  return await newNotebook.save();
}

export async function getNotebooksByFolderId({
  folderId,
  coin,
  page = 1,
  limit = 20,
}: {
  coin: Coin;
  folderId: string;
  page?: number;
  limit?: number;
}) {
  const skip = page * limit;

  const query: Record<string, any> = {
    coin,
  };

  if (folderId !== "all") {
    query.folderId = folderId;
  }

  const data = await NotebooksModel.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })
    .populate("tradeId");

  const total = await NotebooksModel.countDocuments();
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    totalPages,
  };
}

export async function getNotebookById(
  id: string,
): Promise<NotebookDocument | null> {
  return NotebooksModel.findById(id);
}

export async function updateNotebook(
  id: string,
  data: Partial<Notebook>,
): Promise<NotebookDocument | null> {
  return NotebooksModel.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteNotebook(id: string): Promise<boolean> {
  const result = await NotebooksModel.deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function getNotebookByTradeId(tradeId: string) {
  return NotebooksModel.findOne({ tradeId });
}

export async function updateNotebookByTradeId(
  tradeId: string,
  data: {
    content: string;
    folderId: string;
    coin: Coin;
  },
) {
  // Find the trade to get coin
  const { TradeModel } = await import("@/features/trades/model/trades-model");
  const trade = await TradeModel.findById(tradeId);
  if (!trade) {
    throw new Error("Trade not found");
  }

  return await NotebooksModel.findOneAndUpdate(
    { tradeId },
    { ...data, coin: trade.coin },
    {
      upsert: true,
    },
  );
}
