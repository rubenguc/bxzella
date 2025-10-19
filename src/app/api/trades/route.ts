import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { tradesSearchParamsSchema } from "@/features/trades/schemas/trades-api-schemas";
import {
  getTradesByAccountId,
  syncPositions,
} from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, limit, page, startDate, endDate } =
      parseSearchParams(request, tradesSearchParamsSchema);

    await connectDB();
    const synced = await syncPositions(accountId, coin);
    const data = await getTradesByAccountId({
      accountId,
      page,
      limit,
      startDate,
      endDate,
      coin,
    });

    return NextResponse.json({ ...data, synced });
  } catch (err) {
    return handleApiError(err);
  }
}
