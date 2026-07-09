import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { Badge } from "#/components/ui/badge";
import { getNotebookByTradeId, upsertNotebookByTradeId } from "#/features/notebooks/service";
import { getNotebookTemplates } from "#/features/notebooks-templates/service";
import type { NotebookTemplate } from "#/features/notebooks-templates/schema";

interface TradeNotebookProps {
  tradeId: string;
  accountId: string;
  coin: "VST" | "USDT" | "USDC";
}

export function TradeNotebook({ tradeId, accountId, coin }: TradeNotebookProps) {
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState("");

  const { data: notebook, isLoading } = useQuery({
    queryKey: ["trade-notebook", tradeId],
    queryFn: () => getNotebookByTradeId(tradeId),
    enabled: !!tradeId,
  });

  // Recently used templates
  const { data: templatesData } = useQuery({
    queryKey: ["notebook-templates-recently"],
    queryFn: () => getNotebookTemplates(0, 5),
  });

  // Load existing notebook content
  useEffect(() => {
    if (notebook?.content) {
      setContent(notebook.content);
    }
  }, [notebook]);

  const upsertMutation = useMutation({
    mutationFn: () =>
      upsertNotebookByTradeId(tradeId, {
        title: "Trade Notes",
        content,
        contentPlainText: content,
        accountId,
        coin,
      }),
    onSuccess: () => {
      toast.success(m["common_messages.loading"]());
      queryClient.invalidateQueries({ queryKey: ["trade-notebook", tradeId] });
    },
    onError: () => {
      toast.error("Error saving notes");
    },
  });

  const insertTemplate = (template: NotebookTemplate) => {
    setContent(template.content);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative space-y-4">
      <Badge variant="secondary" className="text-sm w-fit">
        {m["trade_info.notes"]()}
      </Badge>

      {/* Recently used templates */}
      {templatesData && templatesData.data.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground text-xs">
            {m["notebooks.notebook_templates.recently_used_templates"]()}
          </span>
          {templatesData.data.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              onClick={() => insertTemplate(template)}
            >
              {template.title}
            </Button>
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={m["trade_info.notes"]()}
        className="min-h-[200px]"
        disabled={upsertMutation.isPending}
      />

      <div className="flex justify-end">
        <Button
          onClick={() => upsertMutation.mutate()}
          disabled={upsertMutation.isPending || isLoading}
        >
          {upsertMutation.isPending ? "Saving..." : m["notebooks.notebook_detail.save"]()}
        </Button>
      </div>
    </div>
  );
}
