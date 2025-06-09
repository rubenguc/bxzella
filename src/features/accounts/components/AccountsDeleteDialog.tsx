"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TriangleAlert } from "lucide-react";
import { IAccountModel } from "../model/accounts";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "@/features/accounts/server/actions/accounts";

interface AccountsDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: IAccountModel;
}

export function AccountsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AccountsDeleteDialogProps) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const response = await deleteAccount(currentRow._id);
    if (response?.error) {
      toast.error(response.message);
      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["accounts"],
    });

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
          Delete Account
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{" "}
            <span className="font-bold">{currentRow.name}</span>?
            <br />
            This cannot be undone.
          </p>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  );
}
