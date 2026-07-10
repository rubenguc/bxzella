import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { TextEditor, type TextEditorRef } from "#/components/text-editor/text-editor";
import {
  createNotebookTemplateAction,
  updateNotebookTemplateAction,
  deleteNotebookTemplateAction,
} from "#/features/notebooks-templates/server-actions";
import type { NotebookTemplate } from "#/features/notebooks-templates/schema";
import { NotebookTemplatePreview } from "./notebook-template-preview";

interface NotebookTemplatesFormProps {
  selectedTemplate: NotebookTemplate | null;
  onSaved: () => void;
  onUseTemplate?: (template: NotebookTemplate) => void;
}

export function NotebookTemplatesForm({
  selectedTemplate,
  onSaved,
  onUseTemplate,
}: NotebookTemplatesFormProps) {
  const queryClient = useQueryClient();
  const editorRef = useRef<TextEditorRef>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isEdit = !!selectedTemplate;

  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.title);
      setContent(selectedTemplate.content);
    } else {
      setTitle("");
      setContent("");
    }
    setIsEditing(false);
  }, [selectedTemplate]);

  const handleSubmit = async () => {
    if (!title.trim() || !content) return;

    setIsSubmitting(true);
    try {
      const result = isEdit && selectedTemplate
        ? await updateNotebookTemplateAction({ data: { id: selectedTemplate.id, data: { title: title.trim(), content } } })
        : await createNotebookTemplateAction({ data: { title: title.trim(), content } });

      if (!result.success) throw new Error(result.error);

      await queryClient.invalidateQueries({ queryKey: ["notebook-templates-recently"] });
      await queryClient.invalidateQueries({ queryKey: ["notebook-templates-list"] });

      toast.success(m["notebooks.notebook_templates.notebook_template_saved"]());

      if (!isEdit) {
        setTitle("");
        setContent("");
        onSaved();
      } else {
        setIsEditing(false);
      }
    } catch {
      toast.error(m["notebooks.notebook_templates.error_creating_notebook_template"]());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    setIsSubmitting(true);
    try {
      const result = await deleteNotebookTemplateAction({ data: selectedTemplate.id });
      if (!result.success) throw new Error(result.error);

      await queryClient.invalidateQueries({ queryKey: ["notebook-templates-recently"] });
      await queryClient.invalidateQueries({ queryKey: ["notebook-templates-list"] });
      toast.success(m["notebooks.notebook_templates.notebook_template_delete"]());
      onSaved();
    } catch {
      toast.error(m["notebooks.notebook_templates.error_deleting_notebook_template"]());
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.title);
      setContent(selectedTemplate.content);
    }
    setIsEditing(false);
  };

  // Preview mode for existing templates
  if (isEdit && !isEditing) {
    return (
      <NotebookTemplatePreview
        template={selectedTemplate}
        onEdit={() => setIsEditing(true)}
        onUseTemplate={onUseTemplate ? () => onUseTemplate(selectedTemplate) : undefined}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-2">
        <label className="text-sm font-medium">{m["notebooks.notebook_templates.title"]()}</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={!isEdit ? m["notebooks.notebook_templates.template_title_placeholder"]() : undefined}
        />
      </div>

      <div className="flex-1 mt-2">
        <TextEditor
          ref={editorRef}
          onChange={setContent}
          initialValue={content}
          isLoading={isSubmitting}
        />
      </div>

      <div className="flex items-center gap-2 mt-3">
        {isEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
            <X className="size-3.5 mr-1.5" />
            {m["common_messages.cancel"]()}
          </Button>
        )}

        <Button
          size="sm"
          className={isEdit ? "ml-auto" : "ml-auto mt-3"}
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content}
        >
          {m["notebooks.notebook_templates.save"]()}
        </Button>
      </div>
    </div>
  );
}
