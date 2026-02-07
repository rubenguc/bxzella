import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { playbooksSearchParamsSchema } from "@/features/playbooks/schemas/playbooks-api-schema";
import {
  createPlaybook,
  getTradesStatisticByPlaybook,
} from "@/features/playbooks/server/db/playbooks-db";
import { getTimeZoneFromHeader } from "@/utils/date-utils";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, limit, page, startDate, endDate } =
      parseSearchParams(request, playbooksSearchParamsSchema);

    await connectDB();

    const timezone = await getTimeZoneFromHeader(headers);

    const data = await getTradesStatisticByPlaybook(
      {
        page,
        limit,
        accountId,
        startDate,
        endDate,
        coin,
      },
      timezone,
    );
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await connectDB();
    const playbook = await createPlaybook(body);
    return NextResponse.json(playbook);
  } catch (err) {
    return handleApiError(err);
  }
}
