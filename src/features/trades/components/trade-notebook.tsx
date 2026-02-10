import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TextEditor } from "@/components/text-editor/text-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { NotebookTemplatesRecentlyList } from "@/features/notebooks/components/notebook-templates-recently-list";
import { updateNotebookByTradeIdAction } from "@/features/notebooks/server/actions/notebooks-actions";
import { getNotebookByTradeId } from "@/features/notebooks/services/notebooks-services";
import { useEditorText } from "@/hooks/use-text-editor";
import type { Coin } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { Badge } from "@/components/ui/badge";

interface TradesNotebooksProps {
  tradeId: string;
  coin: Coin;
}

export function TradeNotebook({ tradeId, coin }: TradesNotebooksProps) {
  const t = useTranslations("trade_info");

  const { selectedAccount } = useUserConfigStore();

  const { editorRef, setEditorValue } = useEditorText();

  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["trade-notebook", tradeId],
    queryFn: () => getNotebookByTradeId(tradeId),
    enabled: !!tradeId,
  });

  const onSave = async () => {
    if (!coin) return;

    const response = await updateNotebookByTradeIdAction(
      tradeId,
      content,
      selectedAccount!._id,
      coin,
    );

    if (response.error) {
      return toast.error(t(response.message));
    }

    toast.success("saved");
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect(() => {
    if (!isLoading && data) {
      setEditorValue(data.content);
    }
  }, [data, isLoading]);

  return (
    <>
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/30 flex justify-center items-center">
          <Spinner />
        </div>
      )}

      <Badge className="text-sm">{t("notes")}</Badge>

      <div>
        <NotebookTemplatesRecentlyList
          onSelectTemplate={(notebookTemplate) => {
            setEditorValue(notebookTemplate.content);
          }}
        />
      </div>

      <TextEditor
        ref={editorRef}
        onChange={(value) => setContent(value || "")}
      />
      <Button className="ml-auto mt-3" onClick={onSave}>
        {t("save")}
      </Button>
    </>
  );
}
