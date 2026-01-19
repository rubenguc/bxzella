import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import type {
  AccountDocument,
  AccountForm,
} from "@/features/accounts/interfaces/accounts-interfaces";
import {
  accountUpdateValidationSchema,
  accountValidationSchema,
} from "@/features/accounts/schemas/accounts-schemas";
import {
  createAccountAction,
  updateAccountAction,
} from "@/features/accounts/server/actions/accounts-actions";
import type { Provider } from "@/interfaces/global-interfaces";

interface AccountsActionDialogProps {
  currentRow?: AccountDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AccountsActionDialogProps) {
  const t = useTranslations("accounts");
  const queryClient = useQueryClient();

  const isEdit = !!currentRow;
  const form = useForm<AccountForm>({
    resolver: zodResolver(
      isEdit ? accountUpdateValidationSchema : accountValidationSchema,
    ),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
        }
      : {
          name: "",
          apiKey: "",
          secretKey: "",
          provider: "bingx" as Provider,
        },
  });

  const onSubmit = async (values: AccountForm) => {
    const response = isEdit
      ? await updateAccountAction(currentRow._id, values)
      : await createAccountAction(values);
    if (response?.error) {
      toast.error(t(response.message));

      return;
    }

    toast.success(t("account_saved_message"));

    await queryClient.invalidateQueries({
      queryKey: ["accounts"],
    });
    form.reset({
      name: "",
      apiKey: "",
      secretKey: "",
      provider: "bingx",
    });
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
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader className="text-left">
          <DialogTitle>
            {t(isEdit ? "edit_account" : "add_new_account")}
          </DialogTitle>
        </DialogHeader>
        <div className="h-[26.25rem] w-full overflow-y-auto py-1">
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
              {!isEdit && (
                <>
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

                  {/*<FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("provider")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bingx">Bingx</SelectItem>
                            <SelectItem value="bitunix">Bitunix</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="" />
                      </FormItem>
                    )}
                  />*/}
                </>
              )}
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
