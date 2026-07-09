import { Pencil, Eye, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { LexicalContentViewer } from "#/components/text-editor/lexical-content-viewer";
import type { NotebookTemplate } from "#/features/notebooks-templates/schema";

interface NotebookTemplatePreviewProps {
  template: NotebookTemplate;
  onEdit: () => void;
  onUseTemplate?: () => void;
  onDelete: () => Promise<void>;
}

export function NotebookTemplatePreview({
  template,
  onEdit,
  onUseTemplate,
  onDelete,
}: NotebookTemplatePreviewProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
            {m["common_messages.edit"]()}
          </Button>

          {onUseTemplate && (
            <Button variant="default" size="sm" onClick={onUseTemplate}>
              <Eye className="size-3.5 mr-1.5" />
              {m["notebooks.notebook_templates.use_template"]()}
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="size-3.5 mr-1.5" />
            {m["notebooks.notebook_templates.delete"]()}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4">
        <LexicalContentViewer content={template.content} />
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              <TriangleAlert className="stroke-destructive mr-1 inline-block" size={18} />
              {m["notebooks.notebook_templates.delete_template"]()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                {m["common_messages.are_your_sure_want_to_delete"]()}{" "}
                <span className="font-bold">{template.title}</span>?
              </p>
              <p className="mt-2">{m["common_messages.this_cannot_be_undone"]()}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m["common_messages.cancel"]()}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {m["common_messages.delete"]()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
