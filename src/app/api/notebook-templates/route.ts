import { type NextRequest, NextResponse } from "next/server";
import { notebooksTemplateSearchParamsSchema } from "@/features/notebooks/schemas/notebooks-template-schema";
import { getNotebookTemplates } from "@/features/notebooks/server/db/notebooks-template-db";
import {
  getUserAuth,
  handleApiError,
  parseSearchParams,
} from "@/utils/server-api-utils";
import connectDB from "@/db/db";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserAuth();

    const { limit, page, sort } = parseSearchParams(
      request,
      notebooksTemplateSearchParamsSchema,
    );

    let sortBy: Record<string, 1 | -1> | undefined;
    if (sort) {
      const direction = sort.startsWith("-") ? -1 : 1;
      const field = sort.startsWith("-") ? sort.slice(1) : sort;
      sortBy = { [field]: direction };
    }

    await connectDB();
    const data = await getNotebookTemplates({
      userId,
      limit,
      page,
      sortBy,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
