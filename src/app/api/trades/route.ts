import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { tradesSearchParamsSchema } from "@/features/trades/schemas/trades-api-schemas";
import {
  getTradesByAccountUID,
  syncPositions,
} from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, limit, page, startDate, endDate } =
      parseSearchParams(request, tradesSearchParamsSchema);

    await connectDB();
    const account = await getAccountById(accountId);
    const accountUID = account.uid;
    const synced = await syncPositions(accountUID, coin);
    const data = await getTradesByAccountUID({
      accountUID,
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
