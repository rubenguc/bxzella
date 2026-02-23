import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Key, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
            >
              <Globe className="h-5 w-5 text-primary" />
            </motion.div>
            {t(isEdit ? "edit_account" : "add_new_account")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your exchange account details"
              : "Connect your exchange account to start tracking trades"}
          </DialogDescription>
        </DialogHeader>
        <div className="h-[26.25rem] w-full overflow-y-auto py-1 pr-1">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder="My Trading Account"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                        <FormLabel className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5" />
                          {t("api_key")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="select-none font-mono"
                            type="password"
                            autoComplete="off"
                            placeholder="Enter your API key"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5" />
                          {t("secret_key")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="select-none font-mono"
                            type="password"
                            autoComplete="off"
                            placeholder="Enter your secret key"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
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
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bingx">
                              <div className="flex items-center gap-2">
                                <img
                                  src="/assets/providers/bingx.jpeg"
                                  alt="BingX"
                                  className="h-5 w-5 rounded-full object-cover"
                                />
                                <span>BingX</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="bitunix">
                              <div className="flex items-center gap-2">
                                <img
                                  src="/assets/providers/bitunix.webp"
                                  alt="Bitunix"
                                  className="h-5 w-5 rounded-full object-cover"
                                />
                                <span>Bitunix</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 space-y-3"
          >
            <p className="text-muted-foreground text-sm">
              <span className="text-amber-500">*</span>{" "}
              {t("account_sync_trades_descriptions")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t.rich("create_api_key_info", {
                link: (chunks) => (
                  <Link
                    className="text-primary font-medium hover:underline"
                    href="/info/create-api-key"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </motion.div>
        </div>
        <DialogFooter>
          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            form="user-form"
            className="min-w-[120px]"
          >
            {t("save_changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
