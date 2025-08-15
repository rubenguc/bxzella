"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "@/features/accounts/server/actions/accounts-actions";
import { useTranslations } from "next-intl";
import { AccountDocument } from "@/features/accounts/interfaces/accounts-interfaces";

interface AccountsDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: AccountDocument;
}

export function AccountsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AccountsDeleteDialogProps) {
  const t = useTranslations("accounts");
  const tCommon = useTranslations("common_messages");
  const tError = useTranslations("errors");

  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const response = await deleteAccount(currentRow._id);
    if (response?.error) {
      toast.error(tError(response.message));
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["accounts"],
    });

    toast.success(t("account_deleted_message"));

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
          {t("delete_account")}
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
