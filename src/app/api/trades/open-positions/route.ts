import connectDB from "@/db/db";
import { getAccountByIdWithCredentials } from "@/features/accounts/server/db/accounts";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import { getUserActiveOpenPositions } from "@/features/bingx/bingx-api";
import { handleApiError } from "@/utils/server-api-utils";
import { accountIdParamValidation } from "@/utils/zod-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const openPositionsSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsedParams = openPositionsSearchParamsSchema.parse(searchParams);

    const { accountId } = parsedParams;

    await connectDB();

    const account = await getAccountByIdWithCredentials(accountId);

    const { decriptedApiKey, decryptedSecretKey } =
      getDecryptedAccountCredentials(account);

    const data = await getUserActiveOpenPositions(
      decriptedApiKey,
      decryptedSecretKey,
    );

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
