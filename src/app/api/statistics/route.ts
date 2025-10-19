import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { statictisSearchParamsSchema } from "@/features/dashboard/schemas/dashboard-api-schema";
import { getTradesStatistic } from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, startDate, endDate, coin } = parseSearchParams(
      request,
      statictisSearchParamsSchema,
    );

    await connectDB();

    const data = await getTradesStatistic({
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
