import { NextResponse } from "next/server";
import { z } from "zod";

export function handleApiError(err: unknown) {
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
