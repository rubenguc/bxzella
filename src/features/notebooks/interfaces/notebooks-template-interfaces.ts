import type { PaginationResponse } from "@/utils/db-utils";

export interface NotebookTemplate {
  userId: string;
  title: string;
  content: string;
  contentPlainText: string;
}

export interface NotebookTemplateDocument extends NotebookTemplate {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Queries
export interface GetNotebookTemplatesParams {
  page?: number;
  limit?: number;
}

export type GetNotebookTemplatesResponse = Promise<
  PaginationResponse<NotebookTemplateDocument>
>;
