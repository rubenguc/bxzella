import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import {
  AISummary,
  AISummaryDocument,
} from "@/features/ai-summary/interfaces/ai-summary-interfaces";
import {
  createAISummaryDb,
  getAISummaryWeek,
} from "@/features/ai-summary/server/db/ai-summary";
import { getAISummaryResult } from "@/features/ai-summary/server/ia/ai-summary";
import { parseModelName } from "@/features/ai-summary/utils/model";
import {
  getTradesStatistic,
  getTradesStatisticByPair,
} from "@/features/trades/server/db/trades-db";
import { handleApiError } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  coinParamValidation,
} from "@/utils/zod-utils";
import { endOfWeek, startOfWeek, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const aiSummaryParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = aiSummaryParamsSchema.parse(searchParams);

    const { accountId } = parsedParams;

    await connectDB();

    const account = await getAccountById(accountId);

    const accountUID = account.uid;

    const nowUTC = toZonedTime(new Date(), "UTC");

    const firstDayLastWeek = startOfWeek(subWeeks(nowUTC, 1));
    const lastDayLastWeek = endOfWeek(subWeeks(nowUTC, 1));

    const lastSummary = await getAISummaryWeek(
      accountUID,
      firstDayLastWeek,
      lastDayLastWeek,
    );

    if (lastSummary) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { statistics, coin, ..._summary } =
        lastSummary as unknown as AISummary;
      return NextResponse.json({ summary: _summary });
    }

    const firstDayLast2 = startOfWeek(subWeeks(nowUTC, 2));
    const lastDayLast2 = endOfWeek(subWeeks(nowUTC, 2));

    const [
      aiSummaryLast2Weeks,
      tradesStatisticsLastWeek,
      tradesStatisticsByPairLastWeek,
    ] = await Promise.all([
      getAISummaryWeek(accountUID, firstDayLast2, lastDayLast2),
      getTradesStatistic({
        accountUID,
        startDate: firstDayLastWeek,
        endDate: lastDayLastWeek,
      }),
      getTradesStatisticByPair({
        accountUID,
        startDate: firstDayLastWeek,
        endDate: lastDayLastWeek,
      }),
    ]);

    if (tradesStatisticsLastWeek.length === 0) {
      return NextResponse.json({ summary: {} });
    }

    const statistics = {
      ...(tradesStatisticsLastWeek[0] || {}),
      pairs: tradesStatisticsByPairLastWeek,
    };

    const summary = await getAISummaryResult(
      statistics,
      aiSummaryLast2Weeks as unknown as AISummaryDocument,
    );

    console.log("summary created");

    const createdSummary = await createAISummaryDb({
      uid: accountUID,
      coin: "VST",
      result: summary,
      startDate: firstDayLastWeek,
      endDate: lastDayLastWeek,
      statistics: statistics,
      model: parseModelName(process.env.AI_MODEL as string),
    });

    return NextResponse.json({ summary: createdSummary });
  } catch (err) {
    return handleApiError(err);
  }
}
