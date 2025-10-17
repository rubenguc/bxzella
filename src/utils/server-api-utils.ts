import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export function handleApiError(err: unknown) {
  console.log(err);

  if (err instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: "Validation error",
        errors: err.errors,
      },
      { status: 400 },
    );
  }

  if (err instanceof Error) {
    return new Response(err.message, {
      status: 500,
    });
  }

  return new Response("server_error", {
    status: 500,
  });
}

export function handleServerActionError(
  message = "server_error",
  error: unknown = null,
) {
  if (error) {
    console.error(message, error);
  }

  return {
    error: true,
    message,
  };
}

export async function getUserAuth() {
  const { userId } = await auth();
  if (userId === null) throw new Error("not_authenticated");
  return userId;
}

export function parseSearchParams<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T,
): z.infer<T> {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  return schema.parse(searchParams);
}
