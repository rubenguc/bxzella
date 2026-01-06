import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { positionDetailsParamsSchema } from "@/features/trades/schemas/trades-api-schemas";
import { getTradeByAccountId } from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> },
) {
  try {
    const { positionId } = await params;

    const { accountId } = parseSearchParams(
      request,
      positionDetailsParamsSchema,
    );

    await connectDB();

    const data = await getTradeByAccountId({
      accountId,
      positionId,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
