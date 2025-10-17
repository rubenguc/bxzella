import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserConfigStore } from "@/store/user-config-store";
import type { NotebookFolderDocument } from "../interfaces/notebooks-folder-interfaces";
import {
  type FolderSchemaForm,
  folderSchema,
} from "../schemas/notebook-folder-schema";
import {
  createNotebookFolderAction,
  updateNotebookFolderAction,
} from "../server/actions/notebooks-folder-actions";
import { FOLDER_COLORS } from "../utils/notebooks-folder-utils";

interface NotebookFolderActionDialogProps {
  selectedNotebookFolder?: NotebookFolderDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotebookFolderActionDialog({
  onOpenChange,
  open,
  selectedNotebookFolder,
}: NotebookFolderActionDialogProps) {
  const t = useTranslations("notebooks.notebooks_folder");
  const queryClient = useQueryClient();

  const { selectedAccountId } = useUserConfigStore();

  const isEdit = !!selectedNotebookFolder;
  const isDefaultFolder = selectedNotebookFolder?.isDefault;
  const isDefaultColor = selectedNotebookFolder?.tagColor === "system";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid, isLoading },
    watch,
    reset,
  } = useForm<FolderSchemaForm>({
    resolver: zodResolver(folderSchema),
    defaultValues: isEdit
      ? {
          name: isDefaultFolder
            ? t(selectedNotebookFolder.name)
            : selectedNotebookFolder.name,
          tagColor: isDefaultColor
            ? FOLDER_COLORS[0]
            : selectedNotebookFolder.tagColor,
        }
      : {
          name: "",
          tagColor: FOLDER_COLORS[0],
        },
  });

  const selectedColor = watch("tagColor");

  const onSubmit = async (data: FolderSchemaForm) => {
    const _data = { ...data };

    if (isDefaultFolder) {
      _data.name = selectedNotebookFolder.name;
    }

    const response = isEdit
      ? await updateNotebookFolderAction(selectedNotebookFolder._id, _data)
      : await createNotebookFolderAction(_data, selectedAccountId);

    if (response.error) {
      return toast.error(t(response.message));
    }

    queryClient.invalidateQueries({ queryKey: ["notebooks-folders"] });

    toast.success(t("folder_created"));

    onOpenChange(false);
    reset({
      name: "",
      tagColor: FOLDER_COLORS[0],
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        reset({
          name: "",
          tagColor: FOLDER_COLORS[0],
        });
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {t(isEdit ? "edit_folder" : "add_new_folder")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">{t("name")}</Label>
            <Input {...register("name")} disabled={isDefaultFolder} />
          </div>
          <div className="grid gap-3">
            <Label>{t("select_color_label")}</Label>
            <div className="flex flex-wrap gap-4">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`rounded-full w-10 h-10 border-2  outline-2  ${selectedColor === color ? " border-black  outline-primary" : "border-transparent outline-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    setValue("tagColor", color, { shouldValidate: true })
                  }
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
