import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import type { UIMessage } from "ai";
import { TrendingUp, BookOpen, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
  onSuggestionClick?: (suggestion: string) => void;
  error?: Error | null;
}

const toolIcons: Record<string, React.ReactNode> = {
  getTrades: <TrendingUp className="size-3" />,
  getNotebooks: <BookOpen className="size-3" />,
  analyzeTradePnL: <Activity className="size-3" />,
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ChatMessageList({ messages, isLoading, onSuggestionClick, error }: ChatMessageListProps) {
  const { user } = useUser();
  const t = useTranslations("trading-assistant");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    { key: "pnl_this_month", text: t("suggestions.pnl_this_month") },
    { key: "analyze_winning_trades", text: t("suggestions.analyze_winning_trades") },
    { key: "win_rate", text: t("suggestions.win_rate") },
    { key: "recent_trade_notes", text: t("suggestions.recent_trade_notes") },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="mx-auto max-w-lg">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-destructive mb-1">
                    {t("chat.error_title")}
                  </h3>
                  <p className="text-sm text-destructive/80">
                    {error.message || t("chat.error_default")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
                <span className="text-2xl font-bold text-white">{t("chat.ai_avatar")}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("title")}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {t("description")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map((suggestion, i) => (
                <div
                  key={suggestion.key}
                  onClick={() => onSuggestionClick?.(suggestion.text)}
                  className="group p-3 rounded-xl border bg-card/50 hover:bg-card transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {suggestion.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const displayName = isUser ? user?.fullName : t("chat.assistant_name");
          const imageUrl = isUser ? user?.imageUrl : undefined;
          const initials = isUser ? getInitials(user?.fullName) : t("chat.ai_avatar");

          return (
            <div
              key={message.id}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                isUser ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {!isUser && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <span className="text-xs font-bold text-white">{t("chat.ai_avatar")}</span>
                  </div>
                </div>
              )}
              <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    {displayName}
                  </span>
                </div>
                <div
                  className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                    isUser
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/25"
                      : "bg-card border shadow-sm"
                  }`}
                >
                  {message.parts.map((part, partIndex) => {
                    if (part.type === "text") {
                      return (
                        <div
                          key={partIndex}
                          className="whitespace-pre-wrap text-sm leading-relaxed"
                        >
                          {part.text}
                        </div>
                      );
                    }
                    if (part.type.startsWith("tool-")) {
                      const toolName = part.type.replace("tool-", "");
                      const icon =
                        toolIcons[toolName] || (
                          <Activity className="size-3" />
                        );
                      return (
                        <div
                          key={partIndex}
                          className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-2 w-fit"
                        >
                          <span className="animate-pulse">{icon}</span>
                          <span>
                            {t("chat.analyzing")}{" "}
                            {toolName.replace(/([A-Z])/g, " $1").trim()}...
                          </span>
                        </div>
                      );
                    }
                    if (part.type === "dynamic-tool") {
                      return (
                        <div
                          key={partIndex}
                          className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-2 w-fit"
                        >
                          <span className="animate-pulse">
                            <Activity className="size-3" />
                          </span>
                          <span>{t("chat.analyzing")} {part.toolName}...</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              {isUser && (
                <div className="flex-shrink-0 mt-1">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={imageUrl} alt={displayName || ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && messages.length > 0 && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-xs font-bold text-white">{t("chat.ai_avatar")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium mb-1">
                {t("chat.assistant_name")}
              </span>
              <div className="bg-card border rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
