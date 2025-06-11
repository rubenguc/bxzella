import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts";
import { getTradesStatistic } from "@/features/trades/server/db/trades";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const account_id = searchParams.get("account_id") || "";
    const startDate = parseInt(searchParams.get("startDate") || "0");
    const endDate = parseInt(searchParams.get("endDate") || "0");

    await connectDB();

    const account = await getAccountById(account_id);

    const accountUID = account.uid;

    const data = await getTradesStatistic(accountUID, startDate, endDate);

    return NextResponse.json(data[0] || {});
  } catch (err) {
    console.log(err);

    return NextResponse.json({
      message: "server_error",
    });
  }
}
