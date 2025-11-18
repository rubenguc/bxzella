import type {
  GetNotebookTemplatesParams,
  GetNotebookTemplatesResponse,
} from "@/features/notebooks/interfaces/notebooks-template-interfaces";
import { baseConfig } from "@/services/api";

export async function getNotebookTemplates(
  params: GetNotebookTemplatesParams,
): GetNotebookTemplatesResponse {
  const response = await baseConfig.get("/notebook-templates", { params });
  return response.data;
}
