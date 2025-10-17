import type {
  Notebook,
  NotebookDocument,
} from "@/features/notebooks/interfaces/notebooks-interfaces";
import { NotebooksModel } from "@/features/notebooks/model/notebooks-model";
import type { PaginationResponse } from "@/global-interfaces";

export async function createNotebook(
  data: Notebook,
): Promise<NotebookDocument> {
  const newNotebook = new NotebooksModel(data);
  return await newNotebook.save();
}

export async function getNotebooks({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}): Promise<PaginationResponse<NotebookDocument>> {
  const skip = (page - 1) * limit;
  const playbooks = await NotebooksModel.find()
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 });

  const total = await NotebooksModel.countDocuments();
  const totalPages = Math.ceil(total / limit);

  return {
    data: playbooks,
    totalPages,
  };
}

export async function getNotebooksByFolderId({
  folderId,
  page = 1,
  limit = 20,
}: {
  folderId: string;
  page?: number;
  limit?: number;
}) {
  const skip = page * limit;

  const query: Record<string, any> = {};

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
  },
) {
  return await NotebooksModel.findOneAndUpdate({ tradeId }, data, {
    upsert: true,
  });
}
