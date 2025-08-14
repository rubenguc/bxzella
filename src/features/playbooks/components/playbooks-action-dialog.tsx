import { useTranslations } from "next-intl";
import { PlaybookDocument } from "../interfaces/playbook-interfaces";
import { useForm } from "react-hook-form";
import { playbookValidationSchema } from "../schemas/playbooks-schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Rules } from "./Rules";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToggle } from "react-use";
import {
  createPlaybookAction,
  updatePlaybookAction,
} from "../server/actions/playbook-actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PlaybooksActionDialogProps {
  currentRow?: PlaybookDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type PlaybookForm = z.infer<typeof playbookValidationSchema>;

export const PlaybooksActionDialog = ({
  currentRow,
  open,
  onOpenChange,
}: PlaybooksActionDialogProps) => {
  const t = useTranslations("playbooks");
  const queryClient = useQueryClient();

  const isEdit = !!currentRow;
  const form = useForm<PlaybookForm>({
    resolver: zodResolver(playbookValidationSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          name: "",
          description: "",
          icon: "",
          rulesGroup: [
            {
              name: t("entry_criteria"),
              rules: [],
            },
            {
              name: t("exit_criteria"),
              rules: [],
            },
          ],
        },
  });

  const onSubmit = async (values: PlaybookForm) => {
    const response = isEdit
      ? await updatePlaybookAction(currentRow._id, values)
      : await createPlaybookAction(values);
    if (response?.error) {
      toast.error(response.message);
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["playbooks"],
    });
    form.reset();
    onOpenChange(false);
  };

  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-4/5 flex flex-col">
        <DialogHeader className="text-left">
          <DialogTitle>
            {t(isEdit ? "edit_playbook" : "add_playbook")}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full overflow-y-auto py-1 flex-1 ">
          <Form {...form}>
            <form
              id="playbook-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5 h-full"
            >
              <FormField
                control={form.control}
                name="icon"
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <Popover open={isOpen} onOpenChange={toggleOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-l w-fit"
                        >
                          {value ? (
                            <span>{value}</span>
                          ) : (
                            <span>{t("add_icon")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end">
                        <EmojiPicker
                          onEmojiClick={({ emoji }) => onChange(emoji)}
                          skinTonesDisabled={false}
                          searchDisabled={false}
                          previewConfig={{
                            showPreview: false,
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rulesGroup"
                render={({ fieldState: { error } }) => (
                  <FormItem>
                    <Rules error={!!error?.message} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            form="playbook-form"
          >
            {t("save_changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
