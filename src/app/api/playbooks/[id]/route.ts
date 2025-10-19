import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { playbookParamsSchema } from "@/features/playbooks/schemas/playbooks-api-schema";
import { getTradesStatisticByPlaybookId } from "@/features/playbooks/server/db/playbooks-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { accountId, coin, endDate, startDate } = parseSearchParams(
      request,
      playbookParamsSchema,
    );

    await connectDB();

    await connectDB();

    const data = await getTradesStatisticByPlaybookId({
      playbookId: id,
      accountId,
      startDate,
      endDate,
      coin,
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return handleApiError(err);
  }
}
