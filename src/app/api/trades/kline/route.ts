import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import { getProvider } from "@/features/providers/utils/providers-utils";
import { getTimeZoneFromHeader } from "@/utils/date-utils";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  coinParamValidation,
} from "@/utils/zod-utils";
import { calculateIdealStartTime } from "@/features/trades/utils/trades-utils";

const klineParamsSchema = z.object({
  coin: coinParamValidation(),
  startTime: z.string().min(0),
  symbol: z.string().min(1),
  accountId: accountIdParamValidation(),
  interval: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { coin, startTime, symbol, accountId, interval } = parseSearchParams(
      request,
      klineParamsSchema,
    );

    await connectDB();
    const timezone = await getTimeZoneFromHeader(headers);

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

    const finalMs = calculateIdealStartTime(startTime, interval, timezone);

    const data = await provider.getKLine({
      coin,
      startTime: finalMs,
      symbol,
      interval,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
