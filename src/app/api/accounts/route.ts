import connectDB from "@/db/db";
import { getAccountsByUserId } from "@/features/accounts/server/db/accounts";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) return new Response("Missing userId", { status: 400 });

    await connectDB();
    const data = await getAccountsByUserId(userId, page, limit);
    return NextResponse.json(data);
  } catch (err) {
    console.log(err);

    return NextResponse.json({
      message: "server_error",
    });
  }
}
