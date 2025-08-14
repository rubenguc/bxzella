import { z } from "zod";
import { useForm } from "react-hook-form";
import { accountValidationSchema } from "@/features/accounts/schemas/accounts";
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
import {
  createAccount,
  updateAccount,
} from "@/features/accounts/server/actions/accounts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AccountDocument } from "@/features/accounts/interfaces/accounts-interfaces";

interface AccountsActionDialogProps {
  currentRow?: AccountDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AccountForm = z.infer<typeof accountValidationSchema>;

export function AccountsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AccountsActionDialogProps) {
  const t = useTranslations("accounts");
  const queryClient = useQueryClient();

  const isEdit = !!currentRow;
  const form = useForm<AccountForm>({
    resolver: zodResolver(accountValidationSchema),
    defaultValues: isEdit
      ? { ...currentRow, apiKey: "", secretKey: "" }
      : {
          name: "",
          apiKey: "",
          secretKey: "",
        },
  });

  const onSubmit = async (values: AccountForm) => {
    const response = isEdit
      ? await updateAccount(currentRow._id, values)
      : await createAccount(values);
    if (response?.error) {
      toast.error(response.message);

      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["accounts"],
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>
            {t(isEdit ? "edit_account" : "add_new_account")}
          </DialogTitle>
        </DialogHeader>
        <div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage className="" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("api_key")}</FormLabel>
                    <FormControl>
                      <Input
                        className="select-none"
                        type="password"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("secret_key")}</FormLabel>
                    <FormControl>
                      <Input
                        className="select-none"
                        type="password"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <p className="mt-5 text-gray-400 text-sm">
            *{t("account_sync_trades_descriptions")}
          </p>
          <p className="mt-5 text-gray-400 text-sm">
            {t.rich("create_api_key_info", {
              link: (chunks) => (
                <Link
                  className="text-blue-400 hover:underline"
                  href="/info/create-api-key"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
        <DialogFooter>
          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            form="user-form"
          >
            {t("save_changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
