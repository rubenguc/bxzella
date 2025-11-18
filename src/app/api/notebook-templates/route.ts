import { type NextRequest, NextResponse } from "next/server";
import { notebooksTemplateSearchParamsSchema } from "@/features/notebooks/schemas/notebooks-template-schema";
import { getNotebookTemplates } from "@/features/notebooks/server/db/notebooks-template-db";
import {
  getUserAuth,
  handleApiError,
  parseSearchParams,
} from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserAuth();

    const { limit, page } = parseSearchParams(
      request,
      notebooksTemplateSearchParamsSchema,
    );

    const data = await getNotebookTemplates({
      userId,
      limit,
      page,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
