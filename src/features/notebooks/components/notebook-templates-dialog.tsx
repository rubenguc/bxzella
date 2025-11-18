import { useTranslations } from "next-intl";
import { useState } from "react";
import { useToggle } from "react-use";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { NotebookTemplateDocument } from "../interfaces/notebooks-template-interfaces";
import { NotebookTemplatesForm } from "./notebook-templates-form";
import { NotebookTemplatesList } from "./notebook-templates-list";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface NotebookTemplatesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NotebookTemplatesDialog({
  onClose,
  open,
}: NotebookTemplatesDialogProps) {
  const t = useTranslations("notebooks.notebook_templates");

  const [isCreating, setIsCreating] = useToggle(false);

  const [selectedTemplate, setSelectedTemplate] =
    useState<NotebookTemplateDocument | null>(null);

  const onSelectedNotebookTemplate = (template: NotebookTemplateDocument) => {
    setIsCreating(true);
    setSelectedTemplate(template);
  };

  const onSaveNotebookTemplate = () => {
    setIsCreating(false);
    setSelectedTemplate(null);
  };

  const _onClose = () => {
    setIsCreating(false);
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={_onClose}>
      <DialogContent
        className="w-full sm:max-w-4/5 bg-card p-0 min-h-[26.25rem]"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>
        <div className="flex">
          <div className="flex-1/3 p-6">
            <NotebookTemplatesList
              onSelectTemplate={onSelectedNotebookTemplate}
            />
          </div>
          <div className="flex-2/3 p-6 bg-sidebar">
            {!isCreating ? (
              <div className="flex flex-1 items-center justify-center h-full">
                <Button onClick={setIsCreating}>
                  {t("create_new_template")}
                </Button>
              </div>
            ) : (
              <NotebookTemplatesForm
                selectedNotebookTemplate={selectedTemplate}
                onSaved={onSaveNotebookTemplate}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
