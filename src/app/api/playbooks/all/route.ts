import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { playbooksAllSearchParamsSchema } from "@/features/playbooks/schemas/playbooks-api-schema";
import { getAllPlaybooks } from "@/features/playbooks/server/db/playbooks-db";
import {
  getUserAuth,
  handleApiError,
  parseSearchParams,
} from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserAuth();

    const { page, limit } = parseSearchParams(
      request,
      playbooksAllSearchParamsSchema,
    );

    await connectDB();

    const data = await getAllPlaybooks({
      userId,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
