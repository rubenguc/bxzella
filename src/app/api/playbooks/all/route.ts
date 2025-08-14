import connectDB from "@/db/db";
import { getAllPlaybooks } from "@/features/playbooks/server/db/playbooks";
import { handleApiError } from "@/utils/server-api-utils";
import { limitParamValidation, pageParamValidation } from "@/utils/zod-utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PlaybooksSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) return new Response("Missing userId", { status: 400 });

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = PlaybooksSearchParamsSchema.parse(searchParams);

    const { page, limit } = parsedParams;

    await connectDB();

    const data = await getAllPlaybooks({
      userId,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return handleApiError(err);
  }
}
