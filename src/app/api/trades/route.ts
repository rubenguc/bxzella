import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import {
  getTradesByAccountUID,
  syncPositions,
} from "@/features/trades/server/db/trades-db";
import { handleApiError } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  coinParamValidation,
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
  coin: coinParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = TradesSearchParamsSchema.parse(searchParams);

    const { accountId, page, limit, startDate, endDate, coin } = parsedParams;

    await connectDB();

    const account = await getAccountById(accountId);

    const accountUID = account.uid;

    const synced = await syncPositions(accountUID, coin);

    const data = await getTradesByAccountUID({
      uid: accountUID,
      page,
      limit,
      startDate,
      endDate,
      coin,
    });

    return NextResponse.json({ ...data, synced });
  } catch (err) {
    console.error(err);
    return handleApiError(err);
  }
}
