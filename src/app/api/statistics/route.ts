import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts";
import { getTradesStatistic } from "@/features/trades/server/db/trades";
import { handleApiError } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  dateParamValidation,
} from "@/utils/zod-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const statictisSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate", tillEndOfTheDay: true }),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = statictisSearchParamsSchema.parse(searchParams);

    const { accountId, startDate, endDate } = parsedParams;

    await connectDB();

    const account = await getAccountById(accountId);

    const accountUID = account.uid;

    const data = await getTradesStatistic({
      accountUID,
      startDate: startDate!,
      endDate: endDate!,
    });

    return NextResponse.json(data[0] || {});
  } catch (err) {
    return handleApiError(err);
  }
}
