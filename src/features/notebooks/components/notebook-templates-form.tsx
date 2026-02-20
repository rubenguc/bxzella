import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToggle } from "react-use";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TextEditor } from "@/components/text-editor/text-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

interface NotebookTemplatesFormProps {
  selectedNotebookTemplate: NotebookTemplateDocument | null;
  onSaved: () => void;
}

export function NotebookTemplatesForm({
  selectedNotebookTemplate,
  onSaved,
}: NotebookTemplatesFormProps) {
  const tCommon = useTranslations("common_messages");
  const t = useTranslations("notebooks.notebook_templates");
  const queryClient = useQueryClient();

  const { editorRef, setEditorValue } = useEditorText();
  const [isOpen, setIsOpen] = useToggle(false);
  const [isDeleting, setIsDeleting] = useToggle(false);

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
    }
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
    form.reset({
      title: "",
      content: "",
    });
    onSaved();
  };

  const onDelete = async () => {
    setIsDeleting(true);
    const response = await deleteNotebookTemplateAction(
      selectedNotebookTemplate?._id as string,
    );

    if (response?.error) {
      setIsDeleting(false);

      return toast.error(response.message);
    }

    await queryClient.invalidateQueries({
      queryKey: ["notebook-templates-recently"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["notebook-templates-list"],
    });

    toast.success(t("notebook_template_delete"));
    form.reset({
      title: "",
      content: "",
    });
    onSaved();
    setIsDeleting(false);
  };

  return (
    <>
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
                  <Input {...field} />
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

          <div className="flex items-center">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={setIsOpen}
                disabled={form.formState.isSubmitting || isDeleting}
                aria-label={t("delete")}
              >
                {t("delete")}
              </Button>
            )}
            <Button
              type="submit"
              className="ml-auto mt-3"
              disabled={form.formState.isSubmitting || isDeleting}
              aria-label={t("save")}
            >
              {t("save")}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        handleConfirm={onDelete}
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
              <span className="font-bold">
                {selectedNotebookTemplate?.title}
              </span>
              ?
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
    </>
  );
}
