import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/db/db";
import { getAccountsByUserId } from "@/features/accounts/server/db/accounts-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";
import { limitParamValidation, pageParamValidation } from "@/utils/zod-utils";

const accountSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Missing userId", { status: 400 });

    const { page, limit } = parseSearchParams(
      request,
      accountSearchParamsSchema,
    );

    await connectDB();
    const data = await getAccountsByUserId({ userId, page, limit });
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
