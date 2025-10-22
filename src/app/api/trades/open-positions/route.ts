import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/db";
import { openPositionsSearchParamsSchema } from "@/features/trades/schemas/trades-api-schemas";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { getProvider } from "@/features/providers/utils/providers-utils";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";

export async function GET(request: NextRequest) {
  try {
    const { accountId, coin } = parseSearchParams(
      request,
      openPositionsSearchParamsSchema,
    );

    await connectDB();

    const account = await getAccountById(accountId);

    if (!account) {
      throw new Error("account_not_found");
    }

    const { decriptedApiKey, decryptedSecretKey } =
      getDecryptedAccountCredentials(account);

    const provider = getProvider(
      account?.provider,
      decriptedApiKey,
      decryptedSecretKey,
    );

    const data = await provider.getOpenPositions(coin);

    return NextResponse.json({
      data,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
