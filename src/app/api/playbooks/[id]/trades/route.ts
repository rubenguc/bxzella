import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { playbookTradesParamsSchema } from "@/features/playbooks/schemas/playbooks-api-schema";
import { getPaginatedTradesByPlaybook } from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";
import { getTimeZoneFromHeader } from "@/utils/date-utils";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { accountId, startDate, endDate, coin, page, limit } =
      parseSearchParams(request, playbookTradesParamsSchema);

    await connectDB();

    const timezone = await getTimeZoneFromHeader(headers);

    const data = await getPaginatedTradesByPlaybook(
      {
        playbookId: id,
        accountId,
        startDate,
        endDate,
        coin,
        page,
        limit,
      },
      timezone,
    );

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
