import { type NextRequest, NextResponse } from "next/server";
import { getNotebookByTradeId } from "@/features/notebooks/server/db/notebooks-db";
import { handleApiError } from "@/utils/server-api-utils";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  try {
    const { tradeId } = await params;
    const data = await getNotebookByTradeId(tradeId);
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
