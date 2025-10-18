import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { getAccountByIdWithCredentials } from "@/features/accounts/server/db/accounts-db";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import { getUserActiveOpenPositions } from "@/features/providers/bingx/bingx-api";
import { openPositionsSearchParamsSchema } from "@/features/trades/schemas/trades-api-schemas";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin } = parseSearchParams(
      request,
      openPositionsSearchParamsSchema,
    );

    await connectDB();
    const account = await getAccountByIdWithCredentials(accountId);
    const { decriptedApiKey, decryptedSecretKey } =
      getDecryptedAccountCredentials(account);
    const data = await getUserActiveOpenPositions(
      decriptedApiKey,
      decryptedSecretKey,
      coin,
    );
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
