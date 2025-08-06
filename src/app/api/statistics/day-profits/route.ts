import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts";
import { getTradeProfitByDays } from "@/features/trades/server/db/trades";
import { handleApiError } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  coinParamValidation,
} from "@/utils/zod-utils";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toZonedTime } from "date-fns-tz";

const dayProfitsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = dayProfitsSearchParamsSchema.parse(searchParams);

    const { accountId, coin } = parsedParams;

    await connectDB();

    const account = await getAccountById(accountId);

    const accountUID = account.uid;

    const nowUTC = toZonedTime(new Date(), "UTC");

    const firstDayLastMonth = startOfMonth(subMonths(nowUTC, 1));
    const lastDayCurrentMonth = endOfMonth(nowUTC);
    const startDate = toZonedTime(firstDayLastMonth, "UTC");
    const endDate = toZonedTime(lastDayCurrentMonth, "UTC");

    const data = await getTradeProfitByDays({
      accountUID,
      startDate,
      endDate,
      coin,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
