import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { getPlaybookTradeProgressWithPlaybook } from "@/features/trades/playbook-trade-progress/db/playbook-trade-progress-db";
import { handleApiError } from "@/utils/server-api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  try {
    const { tradeId } = await params;

    await connectDB();

    const data = await getPlaybookTradeProgressWithPlaybook(tradeId);

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
