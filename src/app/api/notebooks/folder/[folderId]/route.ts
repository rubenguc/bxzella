import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getNotebooksByFolderId } from "@/features/notebooks/server/db/notebooks-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";
import { limitParamValidation, pageParamValidation } from "@/utils/zod-utils";

const notebooksSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) {
  try {
    const { folderId } = await params;
    const { page, limit } = parseSearchParams(request, notebooksSchema);
    const data = await getNotebooksByFolderId({ page, limit, folderId });
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
