import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TextEditor } from "@/components/text-editor/text-editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEditorText } from "@/hooks/use-text-editor";
import type { NotebookTemplateDocument } from "../interfaces/notebooks-template-interfaces";
import {
  type NotebooksTemplateForm,
  notebooksTemplateValidationSchema,
} from "../schemas/notebooks-template-schema";
import {
  createNotebookTemplateAction,
  deleteNotebookTemplateAction,
  updateNotebookTemplateAction,
} from "../server/actions/notebooks-template-actions";
import { NotebookTemplatePreview } from "./notebook-template-preview";

interface NotebookTemplatesFormProps {
  selectedNotebookTemplate: NotebookTemplateDocument | null;
  onSaved: () => void;
  onUseTemplate?: (template: NotebookTemplateDocument) => void;
}

export function NotebookTemplatesForm({
  selectedNotebookTemplate,
  onSaved,
  onUseTemplate,
}: NotebookTemplatesFormProps) {
  const tCommon = useTranslations("common_messages");
  const t = useTranslations("notebooks.notebook_templates");
  const queryClient = useQueryClient();

  const { editorRef, setEditorValue } = useEditorText();

  const [isEditing, setIsEditing] = useState(false);

  const isEdit = !!selectedNotebookTemplate;

  const form = useForm<NotebooksTemplateForm>({
    resolver: zodResolver(notebooksTemplateValidationSchema),
    defaultValues: {
      title: isEdit ? selectedNotebookTemplate.title : "",
      content: isEdit ? selectedNotebookTemplate.content : "",
      contentPlainText: isEdit
        ? (selectedNotebookTemplate.contentPlainText ?? "")
        : "",
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect(() => {
    if (selectedNotebookTemplate) {
      form.reset({
        title: selectedNotebookTemplate.title,
        content: selectedNotebookTemplate.content,
        contentPlainText: selectedNotebookTemplate.contentPlainText ?? "",
      });
      setEditorValue(selectedNotebookTemplate.content);
    } else {
      form.reset({ title: "", content: "", contentPlainText: "" });
    }
    setIsEditing(false);
  }, [selectedNotebookTemplate]);

  const onSubmit = async (data: NotebooksTemplateForm) => {
    const response =
      isEdit && selectedNotebookTemplate._id
        ? await updateNotebookTemplateAction(selectedNotebookTemplate._id, data)
        : await createNotebookTemplateAction(data);

    if (response?.error) {
      return toast.error(response.message);
    }

    await queryClient.invalidateQueries({
      queryKey: ["notebook-templates-recently"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["notebook-templates-list"],
    });

    toast.success(t("notebook_template_saved"));

    if (!isEdit) {
      form.reset({ title: "", content: "" });
      onSaved();
    } else {
      setIsEditing(false);
    }
  };

  const onDelete = async () => {
    const response = await deleteNotebookTemplateAction(
      selectedNotebookTemplate?._id as string,
    );

    if (response?.error) {
      return toast.error(response.message);
    }

    await queryClient.invalidateQueries({
      queryKey: ["notebook-templates-recently"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["notebook-templates-list"],
    });

    toast.success(t("notebook_template_delete"));
    form.reset({ title: "", content: "" });
    onSaved();
  };

  const onCancelEdit = () => {
    if (selectedNotebookTemplate) {
      form.reset({
        title: selectedNotebookTemplate.title,
        content: selectedNotebookTemplate.content,
        contentPlainText: selectedNotebookTemplate.contentPlainText ?? "",
      });
      setEditorValue(selectedNotebookTemplate.content);
    }
    setIsEditing(false);
  };

  // Preview mode — delegate to NotebookTemplatePreview (only for existing templates)
  if (isEdit && !isEditing) {
    return (
      <NotebookTemplatePreview
        template={selectedNotebookTemplate}
        onEdit={() => setIsEditing(true)}
        onUseTemplate={
          onUseTemplate
            ? () => onUseTemplate(selectedNotebookTemplate)
            : undefined
        }
        onDelete={onDelete}
      />
    );
  }

  // Create & Edit modes — same form layout
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("title")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={
                    !isEdit ? t("template_title_placeholder") : undefined
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="gap-0 flex flex-col flex-1 mt-2">
              <FormControl>
                <TextEditor
                  ref={editorRef}
                  initialValue={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2 mt-3">
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
            >
              <X className="size-3.5 mr-1.5" />
              {tCommon("cancel")}
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            className={isEdit ? "ml-auto" : "ml-auto mt-3"}
            disabled={form.formState.isSubmitting}
          >
            {t("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
