import { Eye, Pencil, TriangleAlert, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToggle } from "react-use";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LexicalContentViewer } from "@/components/text-editor/lexical-content-viewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { NotebookTemplateDocument } from "../interfaces/notebooks-template-interfaces";

interface NotebookTemplatePreviewProps {
  template: NotebookTemplateDocument;
  onEdit: () => void;
  onUseTemplate?: () => void;
  onDelete: () => Promise<unknown>;
}

export function NotebookTemplatePreview({
  template,
  onEdit,
  onUseTemplate,
  onDelete,
}: NotebookTemplatePreviewProps) {
  const tCommon = useTranslations("common_messages");
  const t = useTranslations("notebooks.notebook_templates");

  const [isOpen, setIsOpen] = useToggle(false);
  const [isDeleting, setIsDeleting] = useToggle(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold truncate min-w-0">
          {template.title}
        </h3>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="size-3.5 mr-1.5" />
            {tCommon("edit")}
          </Button>

          {onUseTemplate && (
            <Button variant="default" size="sm" onClick={onUseTemplate}>
              <Eye className="size-3.5 mr-1.5" />
              {t("use_template")}
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={setIsOpen}
            disabled={isDeleting}
          >
            <Trash2 className="size-3.5 mr-1.5" />
            {t("delete")}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4">
        <LexicalContentViewer content={template.content} />
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        handleConfirm={handleDelete}
        title={
          <span className="text-destructive">
            <TriangleAlert
              className="stroke-destructive mr-1 inline-block"
              size={18}
            />
            {t("delete_template")}
          </span>
        }
        desc={
          <div className="space-y-4">
            <p className="mb-2">
              {tCommon("are_your_sure_want_to_delete")}{" "}
              <span className="font-bold">{template.title}</span>?
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
        isLoading={isDeleting}
        disabled={isDeleting}
        destructive
      />
    </div>
  );
}
