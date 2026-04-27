import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { exportTradesSearchParamsSchema } from "@/features/trades/schemas/trades-api-schemas";
import { getAllTradesForExport } from "@/features/trades/server/db/trades-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const params = parseSearchParams(request, exportTradesSearchParamsSchema);

    const trades = await getAllTradesForExport({
      accountId: params.accountId,
      coin: params.coin,
    });

    const exportData = trades.map((trade: Record<string, unknown>) => {
      const { _id, notes, ...tradeData } = trade;

      const exportItem: Record<string, unknown> = {
        ...tradeData,
        positionId: trade.positionId,
      };

      if (params.includeNotes) {
        exportItem.notes = notes || null;
      }

      return exportItem;
    });

    if (params.format === "json") {
      const jsonString = JSON.stringify(exportData, null, 2);
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="trades-${params.coin}-${Date.now()}.json"`,
        },
      });
    }

    return NextResponse.json({ data: exportData });
  } catch (err) {
    return handleApiError(err);
  }
}
