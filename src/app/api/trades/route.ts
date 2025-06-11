import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts";
import {
  getTradesByAccountUID,
  syncPositions,
} from "@/features/trades/server/db/trades";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get("account_id") || "";
    const page = parseInt(searchParams.get("page") || "") || 1;
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectDB();

    const account = await getAccountById(_id);

    const accountUID = account.uid;

    await syncPositions(accountUID);

    const data = await getTradesByAccountUID(accountUID, page, limit);

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);

    return NextResponse.json({
      message: "server_error",
    });
  }
}
