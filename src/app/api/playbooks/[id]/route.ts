import connectDB from "@/db/db";
import { handleApiError } from "@/utils/server-api-utils";
import { NextRequest, NextResponse } from "next/server";
import { getTradesStatisticByPlaybookId } from "@/features/playbooks/server/db/playbooks-db";
import {
  accountIdParamValidation,
  coinParamValidation,
  dateParamValidation,
} from "@/utils/zod-utils";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { z } from "zod";

const playbookParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate", tillEndOfTheDay: true }),
  coin: coinParamValidation(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = playbookParamsSchema.parse(searchParams);

    const { id } = await params;

    const { accountId, startDate, endDate, coin } = parsedParams;

    await connectDB();
    const account = await getAccountById(accountId);
    const accountUID = account.uid;

    await connectDB();

    const data = await getTradesStatisticByPlaybookId({
      playbookId: id,
      accountUID,
      startDate: startDate!,
      endDate: endDate!,
      coin,
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return handleApiError(err);
  }
}
