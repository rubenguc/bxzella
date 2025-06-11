import connectDB from "@/db/db";
import { getAccountByIdWithCredentials } from "@/features/accounts/server/db/accounts";
import { getDecryptedAccountCredentials } from "@/features/accounts/utils/encryption";
import { getUserActiveOpenPositions } from "@/features/bingx/bingx-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get("account_id") || "";

    await connectDB();

    const account = await getAccountByIdWithCredentials(_id);

    const { decriptedApiKey, decryptedSecretKey } =
      getDecryptedAccountCredentials(account);

    const data = await getUserActiveOpenPositions(
      decriptedApiKey,
      decryptedSecretKey,
    );

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);

    return NextResponse.json({
      message: "server_error",
    });
  }
}
