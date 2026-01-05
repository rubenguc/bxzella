import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { coinPerformanceSearchParamsSchema } from "@/features/trades/schemas/trades-api-schemas";
import { getTradesStatisticsBySymbol } from "@/features/trades/server/db/trades-db";
import { getTimeZoneFromHeader } from "@/utils/date-utils";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, startDate, endDate } = parseSearchParams(
      request,
      coinPerformanceSearchParamsSchema,
    );

    await connectDB();
    const timezone = await getTimeZoneFromHeader(headers);

    const data = await getTradesStatisticsBySymbol(
      {
        accountId,
        startDate: startDate as string,
        endDate: endDate as string,
        coin,
      },
      timezone,
    );

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
