import type {
  NotebookTemplate,
  NotebookTemplateDocument,
} from "@/features/notebooks/interfaces/notebooks-template-interfaces";
import { NotebookTemplateModel } from "@/features/notebooks/model/notebooks-template.model";
import { getPaginatedData, type PaginationResponse } from "@/utils/db-utils";

export async function createNotebookTemplate(
  data: NotebookTemplate,
): Promise<NotebookTemplateDocument> {
  const notebookTemplate = new NotebookTemplateModel(data);
  return await notebookTemplate.save();
}

export async function getNotebookTemplates({
  page,
  limit,
  userId,
}: {
  userId: string;
  page?: number;
  limit?: number;
}): Promise<PaginationResponse<NotebookTemplateDocument>> {
  return await getPaginatedData(
    NotebookTemplateModel,
    { userId },
    {
      page,
      limit,
      sortBy: {
        updatedAt: -1,
      },
    },
  );
}

export async function updateNotebookTemplate(
  id: string,
  data: Partial<NotebookTemplate>,
): Promise<NotebookTemplateDocument | null> {
  return await NotebookTemplateModel.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteNotebookTemplate(id: string): Promise<boolean> {
  const result = await NotebookTemplateModel.findByIdAndDelete(id);
  return !!result;
}
