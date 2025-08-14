"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PlaybookDocument } from "../interfaces/playbook-interfaces";
import { deletePlaybookAction } from "../server/actions/playbook-actions";

interface PlaybooksDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: PlaybookDocument;
}

export function PlaybooksDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: PlaybooksDeleteDialogProps) {
  const t = useTranslations("playbooks");
  const tCommon = useTranslations("common_messages");
  const tError = useTranslations("errors");

  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const response = await deletePlaybookAction(currentRow._id);
    if (response?.error) {
      toast.error(tError(response.message));
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["playbooks"],
    });

    toast.success(t("playbook_deleted_message"));

    onOpenChange(false);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title={
        <span className="text-destructive">
          <TriangleAlert
            className="stroke-destructive mr-1 inline-block"
            size={18}
          />{" "}
          {t("delete_playbook")}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            {tCommon("are_your_sure_want_to_delete")}{" "}
            <span className="font-bold">{currentRow.name}</span>?
            <br />
            {tCommon("this_cannot_be_undone")}
          </p>

          <Alert variant="destructive">
            <AlertTitle>{tCommon("warning")}</AlertTitle>
            <AlertDescription>{tCommon("be_carefull")}</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={tCommon("delete")}
      destructive
    />
  );
}
