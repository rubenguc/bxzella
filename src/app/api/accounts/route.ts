import connectDB from "@/db/db";
import { getAccountsByUserId } from "@/features/accounts/server/db/accounts";
import { handleApiError } from "@/utils/server-api-utils";
import { limitParamValidation, pageParamValidation } from "@/utils/zod-utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const accountSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Missing userId", { status: 400 });

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = accountSearchParamsSchema.parse(searchParams);

    const { page, limit } = parsedParams;

    await connectDB();
    const data = await getAccountsByUserId(userId, page, limit);
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
