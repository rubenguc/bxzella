import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { NotebookTemplateDocument } from "../interfaces/notebooks-template-interfaces";
import { NotebookTemplatesForm } from "./notebook-templates-form";
import { NotebookTemplatesList } from "./notebook-templates-list";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface NotebookTemplatesDialogProps {
  open: boolean;
  onClose: () => void;
  onUseTemplate?: (template: NotebookTemplateDocument) => void;
}

export function NotebookTemplatesDialog({
  onClose,
  open,
  onUseTemplate,
}: NotebookTemplatesDialogProps) {
  const t = useTranslations("notebooks.notebook_templates");

  const [selectedTemplate, setSelectedTemplate] =
    useState<NotebookTemplateDocument | null>(null);
  const [showForm, setShowForm] = useState(false);

  const onSelectTemplate = (template: NotebookTemplateDocument) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  const onCreateNew = () => {
    setSelectedTemplate(null);
    setShowForm(true);
  };

  const onSaved = () => {
    setSelectedTemplate(null);
    setShowForm(false);
  };

  const _onUseTemplate = (template: NotebookTemplateDocument) => {
    onUseTemplate?.(template);
    _onClose();
  };

  const _onClose = () => {
    setSelectedTemplate(null);
    setShowForm(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={_onClose}>
      <DialogContent
        className="w-dvw md:max-w-5xl! h-dvh md:h-auto max-h-dvh! bg-card p-0! md:p-0"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>
        <div className="flex flex-col md:flex-row h-full md:min-h-[40rem] overflow-hidden">
          <div className="w-full md:w-72 shrink-0 p-4 pt-12 md:pt-4 border-b md:border-b-0 md:border-r overflow-y-auto">
            <NotebookTemplatesList
              onSelectTemplate={onSelectTemplate}
              onCreateNew={onCreateNew}
            />
          </div>
          <div className="flex-1 p-4 md:p-6 bg-sidebar min-w-0 overflow-y-auto">
            {!showForm ? (
              <div className="flex flex-1 items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  {t("select_a_template")}
                </p>
              </div>
            ) : (
              <NotebookTemplatesForm
                selectedNotebookTemplate={selectedTemplate}
                onSaved={onSaved}
                onUseTemplate={selectedTemplate ? _onUseTemplate : undefined}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
