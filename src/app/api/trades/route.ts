import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts";
import {
  getTradesByAccountUID,
  syncPositions,
} from "@/features/trades/server/db/trades";
import { handleApiError } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  dateParamValidation,
  limitParamValidation,
  pageParamValidation,
} from "@/utils/zod-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TradesSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  page: pageParamValidation(),
  limit: limitParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate", tillEndOfTheDay: true }),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = TradesSearchParamsSchema.parse(searchParams);

    const { accountId, page, limit, startDate, endDate } = parsedParams;

    await connectDB();

    const account = await getAccountById(accountId);

    const accountUID = account.uid;

    await syncPositions(accountUID);

    const data = await getTradesByAccountUID({
      uid: accountUID,
      page,
      limit,
      startDate,
      endDate,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
