import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { dayProfitsSearchParamsSchema } from "@/features/day-log/schemas/daily-logs-api-schema";
import { getFullDayProfitsWithTrades } from "@/features/day-log/server/db/day-log-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, limit, page } = parseSearchParams(
      request,
      dayProfitsSearchParamsSchema,
    );

    await connectDB();

    const data = await getFullDayProfitsWithTrades({
      accountId,
      coin,
      limit,
      page,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
