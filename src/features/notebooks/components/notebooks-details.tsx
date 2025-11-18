import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TextEditor } from "@/components/text-editor/text-editor";
import { Button } from "@/components/ui/button";
import { useEditorText } from "@/hooks/use-text-editor";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { formatDecimal } from "@/utils/number-utils";
import { checkWin } from "@/utils/trade-utils";
import { useNotebooksContext } from "../context/notebooks-context";
import { updateNotebookByTradeIdAction } from "../server/actions/notebooks-actions";
import { getNotebookTitle } from "../utils/notebooks-utils";
import { NotebookTemplatesRecentlyList } from "./notebook-templates-recently-list";

export function NotebookDetails() {
  const t = useTranslations("notebooks.notebook_detail");

  const { selectedAccount, coin } = useUserConfigStore();

  const { selectedNotebook } = useNotebooksContext();

  const { editorRef, setEditorValue } = useEditorText();

  const [content, setContent] = useState("");

  const onSave = async () => {
    const response = await updateNotebookByTradeIdAction(
      selectedNotebook!.tradeId!._id,
      content,
      selectedAccount!._id,
    );
    if (response.error) {
      toast.error(t(response.message));
    }

    toast.success("saved");
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect(() => {
    setEditorValue(selectedNotebook?.content || "");
    setContent(selectedNotebook?.content || "");
  }, [selectedNotebook]);

  if (!selectedNotebook) return null;

  const netProfit = selectedNotebook.tradeId?.netProfit || "0";

  const isWin = checkWin(netProfit);

  return (
    <div className="md:w-4/5 flex flex-col px-2 flex-1">
      <div className="flex flex-col mb-4">
        <h3 className="font-bold text-xl">
          {getNotebookTitle(selectedNotebook)}
        </h3>
        <div className="flex gap-2 items-center text-muted-foreground text-sm">
          {`${t("created")} ${transformTimeToLocalDate(selectedNotebook.createdAt)} ${t("last_updated")} ${transformTimeToLocalDate(selectedNotebook.updatedAt)}`}
        </div>
      </div>

      <div className="border-2 border-accent rounded-md p-2 mb-3">
        <h3 className={isWin ? "text-green-600" : "text-red-600"}>
          {t("net_pnl")} {formatDecimal(Number(netProfit), 4)} {coin}
        </h3>
      </div>

      <div className="my-4">
        <NotebookTemplatesRecentlyList
          onSelectTemplate={(notebookTemplate) =>
            setEditorValue(notebookTemplate.content)
          }
        />
      </div>

      <TextEditor ref={editorRef} onChange={setContent} />
      <div className="flex justify-end mt-3">
        <Button onClick={onSave}>{t("save")}</Button>
      </div>
    </div>
  );
}
