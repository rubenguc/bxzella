import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  APICallError,
  LoadAPIKeyError,
  NoContentGeneratedError,
} from "ai";
import { headers } from "next/headers";
import { getSystemPrompt } from "@/features/trading-assistant/server/system-prompt";
import { createChatTools } from "@/features/trading-assistant/server/tools";
import { chatRequestSchema } from "@/features/trading-assistant/schemas/chat-request.schema";
import { getTimeZoneFromHeader } from "@/utils/date-utils";
import { MODEL } from "@/features/trading-assistant/server/model";
import connectDB from "@/db/db";

export const maxDuration = 60;

function getErrorMessage(error: unknown): { status: number; message: string } {
  if (error instanceof LoadAPIKeyError) {
    return {
      status: 500,
      message: "API key not configured. Please check server configuration.",
    };
  }

  if (error instanceof NoContentGeneratedError) {
    return {
      status: 500,
      message: "No response generated. Please try again.",
    };
  }

  if (error instanceof APICallError) {
    if (error.statusCode === 429) {
      return {
        status: 429,
        message: "Rate limit exceeded. Please wait a moment and try again.",
      };
    }

    if (error.statusCode && error.statusCode >= 500) {
      return {
        status: 503,
        message: "Service temporarily unavailable. Please try again later.",
      };
    }

    if (error.statusCode === 401 || error.statusCode === 403) {
      return {
        status: 401,
        message: "Authentication failed. Please check your credentials.",
      };
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("quota") || message.includes("rate limit")) {
      return {
        status: 429,
        message: "Quota exceeded. Please try again in a minute.",
      };
    }

    if (message.includes("timeout")) {
      return {
        status: 504,
        message: "Request timed out. Please try again.",
      };
    }

    if (message.includes("network") || message.includes("fetch")) {
      return {
        status: 503,
        message: "Network error. Please check your connection.",
      };
    }
  }

  return {
    status: 500,
    message: "An unexpected error occurred. Please try again.",
  };
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const parsed = chatRequestSchema.parse(body);
    const { accountId, coin, messages } = parsed;

    const timezone = await getTimeZoneFromHeader(headers);

    await connectDB();

    const result = streamText({
      model: MODEL,
      system: getSystemPrompt(),
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools: createChatTools({ accountId, coin, timezone }),
      onError: (error) => {
        console.error("[Chat API] Stream error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Chat API] Error:", error);

    const { status, message } = getErrorMessage(error);

    return Response.json(
      { error: message },
      {
        status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
