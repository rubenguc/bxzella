import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts";
import {
  createPlaybook,
  getTradesStatisticByPlaybook,
} from "@/features/playbooks/server/db/playbooks";
import { handleApiError } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  coinParamValidation,
  dateParamValidation,
  limitParamValidation,
  pageParamValidation,
} from "@/utils/zod-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const playbooksSearchParamsSchema = z.object({
  page: pageParamValidation(),
  limit: limitParamValidation(),
  accountId: accountIdParamValidation(),
  startDate: dateParamValidation({ field: "startDate" }),
  endDate: dateParamValidation({ field: "endDate", tillEndOfTheDay: true }),
  coin: coinParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = playbooksSearchParamsSchema.parse(searchParams);

    const { page, limit, accountId, startDate, endDate, coin } = parsedParams;

    await connectDB();
    const account = await getAccountById(accountId);
    const accountUID = account.uid;

    const data = await getTradesStatisticByPlaybook({
      page,
      limit,
      accountUID,
      startDate: startDate!,
      endDate: endDate!,
      coin,
    });
    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await connectDB();
    const playbook = await createPlaybook(body);
    return NextResponse.json(playbook);
  } catch (err) {
    return handleApiError(err);
  }
}
