import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { getAISummaryByUID } from "@/features/ai-summary/server/db/ai-summary";
import { handleApiError } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  limitParamValidation,
  pageParamValidation,
} from "@/utils/zod-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const aiSummaryParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = aiSummaryParamsSchema.parse(searchParams);

    const { accountId, page, limit } = parsedParams;

    await connectDB();

    const account = await getAccountById(accountId);
    const accountUID = account.uid;

    const data = await getAISummaryByUID(accountUID, page, limit);

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
