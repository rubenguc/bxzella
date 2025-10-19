import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { dayProfitsSearchParamsSchema } from "@/features/dashboard/schemas/dashboard-api-schema";
import { getTradeProfitByDays } from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin } = parseSearchParams(
      request,
      dayProfitsSearchParamsSchema,
    );

    await connectDB();

    const nowUTC = toZonedTime(new Date(), "UTC");

    const firstDayLastMonth = startOfMonth(subMonths(nowUTC, 1));
    const lastDayCurrentMonth = endOfMonth(nowUTC);
    const startDate = format(
      toZonedTime(firstDayLastMonth, "UTC"),
      "yyyy-MM-dd",
    );
    const endDate = format(
      toZonedTime(lastDayCurrentMonth, "UTC"),
      "yyyy-MM-dd",
    );

    const data = await getTradeProfitByDays({
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
