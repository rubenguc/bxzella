import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
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
    const account = await getAccountById(accountId);
    const accountUID = account.uid;

    await connectDB();

    const data = await getTradesStatisticByPlaybookId({
      playbookId: id,
      accountUID,
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
