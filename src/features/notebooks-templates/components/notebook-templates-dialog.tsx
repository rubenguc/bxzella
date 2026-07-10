import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "#/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { NotebookTemplatesList } from "./notebook-templates-list";
import { NotebookTemplatesForm } from "./notebook-templates-form";
import type { NotebookTemplate } from "#/features/notebooks-templates/schema";

interface NotebookTemplatesDialogProps {
  open: boolean;
  onClose: () => void;
  onUseTemplate?: (template: NotebookTemplate) => void;
}

export function NotebookTemplatesDialog({
  open,
  onClose,
  onUseTemplate,
}: NotebookTemplatesDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<NotebookTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);

  const onSelectTemplate = (template: NotebookTemplate) => {
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

  const _onUseTemplate = (template: NotebookTemplate) => {
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
        className="max-w-5xl! max-h-dvh! bg-card p-0!"
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
                  Select a template
                </p>
              </div>
            ) : (
              <NotebookTemplatesForm
                selectedTemplate={selectedTemplate}
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
