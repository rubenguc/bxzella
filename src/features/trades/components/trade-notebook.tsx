import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { TextEditor, type TextEditorRef } from "#/components/text-editor/text-editor";
import { getNotebookByTradeId } from "#/features/notebooks/service";
import { upsertNotebookAction } from "#/features/notebooks/server-actions";
import { NotebookTemplatePicker } from "#/features/notebooks-templates/components/notebook-template-picker";
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
  const [notebookTemplateId, setNotebookTemplateId] = useState<string | undefined>(undefined);
  const [hasSetInitialContent, setHasSetInitialContent] = useState(false);

  const { data: notebook, isLoading } = useQuery({
    queryKey: ["trade-notebook", tradeId],
    queryFn: () => getNotebookByTradeId(tradeId),
    enabled: !!tradeId,
  });

  // Load existing notebook content into the editor on first load
  useEffect(() => {
    if (notebook?.content && !hasSetInitialContent) {
      editorRef.current?.setInitialValue(notebook.content);
      setContent(notebook.content);
      setHasSetInitialContent(true);
    }
  }, [notebook, hasSetInitialContent]);

  const upsertMutation = useMutation({
    mutationFn: () =>
      upsertNotebookAction({
        data: {
          tradeId,
          content,
          notebookTemplateId,
          accountId,
          coin,
        },
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Saved");
        queryClient.invalidateQueries({ queryKey: ["trade-notebook", tradeId] });
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Error saving notes");
    },
  });

  const insertTemplate = useCallback(
    (template: NotebookTemplate) => {
      editorRef.current?.setInitialValue(template.content);
      setContent(template.content);
      setNotebookTemplateId(template.id);
    },
    [],
  );

  const handleEditorChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  return (
    <div className="relative space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm w-fit">
          {m["trade_info.notes"]()}
        </Badge>
      </div>

      <NotebookTemplatePicker onSelectTemplate={insertTemplate} />

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
          {upsertMutation.isPending
            ? m["accounts.saving_action"]()
            : m["notebooks.notebook_detail.save"]()}
        </Button>
      </div>
    </div>
  );
}
