import { endOfMonth, format, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { dayProfitsByMonthSearchParamsSchema } from "@/features/dashboard/schemas/dashboard-api-schema";
import { getTradeProfitByDays } from "@/features/trades/server/db/trades-db";
import { getTimeZoneFromHeader } from "@/utils/date-utils";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, month } = parseSearchParams(
      request,
      dayProfitsByMonthSearchParamsSchema,
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

    const data = await getTradeProfitByDays(
      { accountId, startDate, endDate, coin },
      timezone,
    );

    const mapped = data.map(
      (d: { _id: string; netProfit: number; trades: unknown[] }) => ({
        date: d._id,
        netPnL: d.netProfit,
        totalTrades: d.trades.length,
        trades: d.trades,
      }),
    );

    return NextResponse.json(mapped);
  } catch (err) {
    return handleApiError(err);
  }
}
