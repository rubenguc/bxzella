import { motion } from "motion/react";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Profit } from "@/components/profit";
import { TextEditor } from "@/components/text-editor/text-editor";
import { Button } from "@/components/ui/button";
import { useEditorText } from "@/hooks/use-text-editor";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { checkWin } from "@/utils/trade-utils";
import { useNotebooksContext } from "../context/notebooks-context";
import { useNotebookFoldersContext } from "../context/notebook-folders-context";
import { updateNotebookByTradeIdAction } from "../server/actions/notebooks-actions";
import { getNotebookTitle } from "../utils/notebooks-utils";
import { NotebookTemplatesRecentlyList } from "./notebook-templates-recently-list";

export function NotebookDetails() {
  const t = useTranslations("notebooks.notebook_detail");
  const tCommon = useTranslationsCommon("common_messages");
  const queryClient = useQueryClient();

  const { selectedAccount, coin } = useUserConfigStore();
  const { selectedNotebookFolder } = useNotebookFoldersContext();
  const { selectedNotebook, setSelectedNotebook } = useNotebooksContext();

  const { editorRef, setEditorValue } = useEditorText();

  const [content, setContent] = useState("");

  const folderId = selectedNotebookFolder?._id ?? "all";

  const onSave = async () => {
    const response = await updateNotebookByTradeIdAction(
      selectedNotebook!.tradeId!._id,
      content,
      selectedAccount!._id,
      coin,
    );
    if (response.error) {
      toast.error(t(response.message));
      return;
    }

    const updatedNotebook = (response as { data?: any }).data;

    if (updatedNotebook) {
      setSelectedNotebook((prev) =>
        prev
          ? {
              ...prev,
              content: updatedNotebook.content,
              updatedAt: updatedNotebook.updatedAt,
            }
          : null,
      );

      queryClient.setQueryData(
        ["notebooks-by-folder-id", folderId, coin],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((notebook: any) =>
                notebook._id === updatedNotebook._id
                  ? {
                      ...notebook,
                      content: updatedNotebook.content,
                      updatedAt: updatedNotebook.updatedAt,
                    }
                  : notebook,
              ),
            })),
          };
        },
      );
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="md:w-4/5 flex flex-col px-4 py-2 flex-1"
    >
      <div className="flex flex-col mb-6 pb-4 border-b border-border/50">
        <h3 className="font-bold text-2xl text-foreground mb-2">
          {getNotebookTitle(selectedNotebook)}
        </h3>
        <div className="flex gap-2 items-center text-muted-foreground text-sm">
          <span>{t("created")}</span>
          <time className="font-medium text-foreground">
            {transformTimeToLocalDate(selectedNotebook.createdAt)}
          </time>
          <span>•</span>
          <span>{t("last_updated")}</span>
          <time className="font-medium text-foreground">
            {transformTimeToLocalDate(selectedNotebook.updatedAt)}
          </time>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`rounded-xl p-4 mb-4 border-2 ${
          isWin
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${isWin ? "text-emerald-500" : "text-red-500"}`}
          >
            {t("net_pnl")}
          </span>
          <Profit
            amount={Number(netProfit)}
            coin={coin}
            className={isWin ? "text-emerald-500" : "text-red-500"}
          />
        </div>
      </motion.div>

      <div className="my-4">
        <NotebookTemplatesRecentlyList
          onSelectTemplate={(notebookTemplate) =>
            setEditorValue(notebookTemplate.content)
          }
        />
      </div>

      <div className="flex-1 flex flex-col">
        <TextEditor ref={editorRef} onChange={setContent} />
        <div className="flex justify-end mt-4">
          <Button
            onClick={onSave}
            aria-label={tCommon("aria_add_note")}
            className="min-w-[120px]"
          >
            {t("save")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
