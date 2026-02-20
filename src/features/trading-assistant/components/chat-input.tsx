import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const MAX_LINES = 5;
const LINE_HEIGHT = 20;

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const t = useTranslations("trading-assistant");
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state, isMobile } = useSidebar();

  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (textareaRef.current) {
      const lines = Math.min(input.split("\n").length, MAX_LINES);
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${lines * LINE_HEIGHT + 16}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="fixed bottom-0 z-10 bg-background/80 backdrop-blur-xl border-t border-white/5 transition-all duration-300"
      style={{
        left: isMobile ? 0 : isCollapsed ? "3rem" : "16rem",
        right: 0,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-5">
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "relative group rounded-2xl transition-all duration-300",
              "bg-gradient-to-br from-muted/80 to-muted/40",
              "border border-white/10 dark:border-white/5",
              "focus-within:border-blue-500/50 focus-within:from-blue-500/10 focus-within:to-purple-500/10",
              "shadow-lg shadow-black/5",
            )}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10" />

            <div className="flex items-end gap-3 p-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t("chat.input_placeholder")}
                disabled={disabled}
                rows={1}
                className={cn(
                  "flex-1 bg-transparent border-0 outline-none resize-none",
                  "text-sm leading-5 px-3 py-2.5",
                  "text-foreground placeholder:text-muted-foreground/60",
                  "transition-colors duration-200",
                  "min-h-[36px] max-h-[116px]",
                  "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20",
                )}
                style={{
                  lineHeight: `${LINE_HEIGHT}px`,
                }}
              />

              <Button
                type="submit"
                disabled={disabled || !input.trim()}
                size="icon"
                className={cn(
                  "rounded-xl h-9 w-9 shrink-0",
                  "bg-gradient-to-br from-blue-600 to-purple-600",
                  "hover:from-blue-500 hover:to-purple-500",
                  "shadow-lg shadow-purple-500/25",
                  "transition-all duration-300",
                  "hover:scale-105 hover:shadow-purple-500/40",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-purple-500/25",
                  "active:scale-95",
                )}
              >
                <Send
                  className={cn(
                    "size-4 transition-transform duration-300",
                    isFocused ? "translate-x-0.5 -translate-y-0.5" : "",
                  )}
                />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
