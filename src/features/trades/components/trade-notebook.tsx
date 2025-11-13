import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { TextEditor } from "@/components/text-editor/text-editor";
import { Button } from "@/components/ui/button";
import { updateNotebookByTradeIdAction } from "@/features/notebooks/server/actions/notebooks-actions";
import { getNotebookByTradeId } from "@/features/notebooks/services/notebooks-services";
import { useUserConfigStore } from "@/store/user-config-store";

interface TradesNotebooksProps {
  tradeId: string;
}

export function TradeNotebook({ tradeId }: TradesNotebooksProps) {
  const t = useTranslations("trade_info");

  const { selectedAccount } = useUserConfigStore();

  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["trade-notebook", tradeId],
    queryFn: () => getNotebookByTradeId(tradeId),
    enabled: !!tradeId,
  });

  const onSave = async () => {
    const response = await updateNotebookByTradeIdAction(
      tradeId,
      content,
      selectedAccount!._id,
    );

    if (response.error) {
      toast.error(t(response.message));
    }

    toast.success("saved");
  };

  return (
    <>
      <span className="text-sm mb-3 bg-accent w-fit rounded-md py-1 px-2">
        {t("trade_note")}
      </span>

      <TextEditor
        isLoading={isLoading}
        initialValue={data?.content || ""}
        onChange={(value) => setContent(value || "")}
      />
      <div className="flex justify-end mt-3">
        <Button onClick={onSave}>{t("save")}</Button>
      </div>
    </>
  );
}
