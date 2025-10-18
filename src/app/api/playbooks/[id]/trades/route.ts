import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { playbookTradesParamsSchema } from "@/features/playbooks/schemas/playbooks-api-schema";
import { getPaginatedTradesByPlaybook } from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { accountId, startDate, endDate, coin, page, limit } =
      parseSearchParams(request, playbookTradesParamsSchema);

    await connectDB();
    const account = await getAccountById(accountId);
    const accountUID = account.uid;

    const data = await getPaginatedTradesByPlaybook({
      playbookId: id,
      accountUID,
      startDate,
      endDate,
      coin,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
