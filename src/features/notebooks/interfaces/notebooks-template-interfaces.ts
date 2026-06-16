import type { PaginationResponse } from "@/utils/db-utils";

export interface NotebookTemplate {
  userId: string;
  title: string;
  content: string;
  contentPlainText: string;
  lastTimeUsed?: Date;
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
  sort?: string;
}

export type GetNotebookTemplatesResponse = Promise<
  PaginationResponse<NotebookTemplateDocument>
>;
