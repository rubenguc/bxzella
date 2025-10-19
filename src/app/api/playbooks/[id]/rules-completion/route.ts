import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { playbookRulesCompletionParamsSchema } from "@/features/playbooks/schemas/playbooks-api-schema";
import { getPlaybookRulesCompletionByPlaybookId } from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { accountId, coin, endDate, startDate } = parseSearchParams(
      request,
      playbookRulesCompletionParamsSchema,
    );

    await connectDB();

    await connectDB();

    const data = await getPlaybookRulesCompletionByPlaybookId({
      playbookId: id,
      accountId,
      startDate,
      endDate,
      coin,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
