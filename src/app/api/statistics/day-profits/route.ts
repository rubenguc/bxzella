import { endOfMonth, format, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { dayProfitsSearchParamsSchema } from "@/features/dashboard/schemas/dashboard-api-schema";
import { getTimeZoneFromHeader } from "@/utils/date-utils";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";
import { getDayProfitsWithTrades } from "@/features/day-log/server/db/day-log-db";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, month } = parseSearchParams(
      request,
      dayProfitsSearchParamsSchema,
    );

    const timezone = await getTimeZoneFromHeader(headers);

    await connectDB();

    let startDate: string, endDate: string;

    if (month) {
      const [year, monthStr] = month.split("-");
      const monthNum = parseInt(monthStr, 10) - 1;

      const monthDate = new Date(parseInt(year, 10), monthNum, 1);
      const firstDayOfMonth = startOfMonth(monthDate);
      const lastDayOfMonth = endOfMonth(monthDate);

      startDate = format(firstDayOfMonth, "yyyy-MM-dd");
      endDate = format(lastDayOfMonth, "yyyy-MM-dd");
    } else {
      const nowUTC = toZonedTime(new Date(), "UTC").getTime();
      const now = nowUTC + timezone;

      const firstDayCurrentMonth = startOfMonth(now);
      const lastDayCurrentMonth = endOfMonth(now);
      startDate = format(firstDayCurrentMonth, "yyyy-MM-dd");
      endDate = format(lastDayCurrentMonth, "yyyy-MM-dd");
    }

    const data = await getDayProfitsWithTrades({
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
