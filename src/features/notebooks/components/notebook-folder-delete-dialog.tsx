import { useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { NotebookFolderDocument } from "../interfaces/notebooks-folder-interfaces";
import { deleteNotebookFolderAction } from "../server/actions/notebooks-folder-actions";

interface NotebookFolderDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNotebookFolder: NotebookFolderDocument;
}

export function NotebookFolderDeleteDialog({
  open,
  onOpenChange,
  selectedNotebookFolder,
}: NotebookFolderDeleteDialogProps) {
  const t = useTranslations("notebooks.notebooks_folder");
  const tCommon = useTranslations("common_messages");

  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const response = await deleteNotebookFolderAction(
      selectedNotebookFolder._id,
    );
    if (response?.error) {
      toast.error(t(response.message));
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["notebooks-folders"],
    });

    toast.success(t("folder_deleted"));

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
          {t("delete_folder")}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            {tCommon("are_your_sure_want_to_delete")}{" "}
            <span className="font-bold">{selectedNotebookFolder.name}</span>?
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
