import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { TextEditor, type TextEditorRef } from "#/components/text-editor/text-editor";
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
  const editorRef = useRef<TextEditorRef>(null);

  const [content, setContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

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
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["trade-notebook", tradeId] });
    },
    onError: () => {
      toast.error("Error saving notes");
    },
  });

  const insertTemplate = useCallback(
    (template: NotebookTemplate) => {
      editorRef.current?.setInitialValue(template.content);
      setContent(template.content);
      setSelectedTemplateId(template.id);
    },
    [],
  );

  const handleEditorChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-sm w-fit">
          {m["trade_info.notes"]()}
        </Badge>
      </div>

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

      <TextEditor
        ref={editorRef}
        onChange={handleEditorChange}
        isLoading={upsertMutation.isPending}
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
