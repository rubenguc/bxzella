"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useUserConfigStore } from "@/store/user-config-store";
import { ChatMessageList } from "@/features/trading-assistant/components/chat-message-list";
import { ChatInput } from "@/features/trading-assistant/components/chat-input";
import { Timezone } from "@/utils/date-utils";

export default function TradingAssistant() {
  const { selectedAccount, coin } = useUserConfigStore();

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: {
        Timezone: String(Timezone),
      },
    }),
    onError: (error) => {
      console.error("[Chat] Error:", error);
    },
  });

  const handleSendMessage = (content: string) => {
    if (error) {
      clearError();
    }
    sendMessage(
      { text: content },
      {
        body: {
          accountId: selectedAccount?._id ?? "",
          coin,
        },
      },
    );
  };

  const isLoading = status === "streaming";

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        onSuggestionClick={handleSendMessage}
        error={error}
      />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
