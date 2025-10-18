import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { playbooksSearchParamsSchema } from "@/features/playbooks/schemas/playbooks-api-schema";
import {
  createPlaybook,
  getTradesStatisticByPlaybook,
} from "@/features/playbooks/server/db/playbooks-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin, limit, page, startDate, endDate } =
      parseSearchParams(request, playbooksSearchParamsSchema);

    await connectDB();
    const account = await getAccountById(accountId);
    const accountUID = account.uid;

    const data = await getTradesStatisticByPlaybook({
      page,
      limit,
      accountUID,
      startDate,
      endDate,
      coin,
    });
    return NextResponse.json(data);
  } catch (err) {
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
