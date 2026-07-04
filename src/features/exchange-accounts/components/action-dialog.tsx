import { useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Globe, Key } from "lucide-react";

import { m } from "#/paraglide/messages";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { FieldError } from "#/components/form/field-error";
import {
  PROVIDER_LIST,
  PROVIDER_INFO,
} from "#/features/exchange-providers/types";
import type { AccountItem } from "#/features/exchange-accounts/types";
import {
  accountSchema,
  accountUpdateSchema,
  type AccountForm,
} from "#/features/exchange-accounts/validation";
import {
  createAccountAction,
  updateAccountAction,
} from "#/features/exchange-accounts/server-actions";

interface Props {
  currentRow?: AccountItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Map server-action error keys to i18n message keys */
const errorMessages: Record<string, string> = {
  invalid_account_data: "accounts.invalid_account_data",
  invalid_api_keys: "accounts.invalid_api_keys",
  account_already_exists: "accounts.account_already_exists",
  server_error: "errors.server_error",
  unauthorized: "errors.server_error",
};

function translateError(error: string): string {
  const key = errorMessages[error] ?? "errors.server_error";
  return (m as Record<string, () => string>)[key]?.() ?? error;
}

export function AccountsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!currentRow;
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: isEdit
      ? {
          name: currentRow!.name,
          apiKey: "",
          secretKey: "",
          provider: currentRow!.provider,
        }
      : { name: "", apiKey: "", secretKey: "", provider: "bingx" as const },
    validators: {
      onSubmit: (isEdit ? accountUpdateSchema : accountSchema) as any,
    },
    onSubmit: async ({ value, formApi }) => {
      const result =
        isEdit && currentRow
          ? await updateAccountAction({
              data: { id: currentRow.id, data: value },
            })
          : await createAccountAction({ data: value });

      if (!result.success) {
        formApi.setErrorMap({
          onSubmit: { form: translateError(result.error), fields: {} },
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["exchange-accounts"] });
      form.reset();
      onOpenChange(false);
    },
  });

  const handleOpenChange = useCallback(
    (state: boolean) => {
      if (!state) {
        form.reset();
        onOpenChange(false);
      }
    },
    [form, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            {m[isEdit ? "accounts.edit_account" : "accounts.add_new_account"]()}
          </DialogTitle>
          <DialogDescription>
            {m[
              isEdit ? "accounts.edit_description" : "accounts.add_description"
            ]()}
          </DialogDescription>
        </DialogHeader>

        <form
          id="account-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Name */}
          <form.Field name="name">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>{m["accounts.name"]()}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={m["accounts.name_placeholder"]()}
                  autoComplete="off"
                />
                <FieldError error={field.state.meta.errors?.[0]} />
              </div>
            )}
          </form.Field>

          {/* Add-only fields */}
          {!isEdit && (
            <>
              {/* API Key */}
              <form.Field name="apiKey">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2"
                    >
                      <Key className="h-3.5 w-3.5" />
                      {m["accounts.api_key"]()}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      className="select-none font-mono"
                      placeholder={m["accounts.api_key_placeholder"]()}
                      autoComplete="off"
                    />
                    <FieldError error={field.state.meta.errors?.[0]} />
                  </div>
                )}
              </form.Field>

              {/* Secret Key */}
              <form.Field name="secretKey">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2"
                    >
                      <Key className="h-3.5 w-3.5" />
                      {m["accounts.secret_key"]()}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      className="select-none font-mono"
                      placeholder={m["accounts.secret_key_placeholder"]()}
                      autoComplete="off"
                    />
                    <FieldError error={field.state.meta.errors?.[0]} />
                  </div>
                )}
              </form.Field>

              {/* Provider */}
              <form.Field name="provider">
                {(field) => (
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium">
                      {m["accounts.provider"]()}
                    </span>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) =>
                        field.handleChange(v as AccountForm["provider"])
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={m["accounts.select_provider"]()}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_LIST.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <div className="flex items-center gap-2">
                              <img
                                src={PROVIDER_INFO[p.value].image}
                                alt={p.label}
                                className="h-5 w-5 rounded-full object-cover"
                              />
                              <span>{p.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError error={field.state.meta.errors?.[0]} />
                  </div>
                )}
              </form.Field>

              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground">
                  <span className="text-amber-500">*</span>{" "}
                  {m["accounts.api_keys_encrypted_info"]()}
                </p>
              </div>
            </>
          )}
        </form>

        {/* Server error (above submit button) */}
        <form.Subscribe selector={(state: any) => state.errorMap}>
          {(errorMap: Record<string, unknown>) => {
            const msg = (errorMap.onSubmit as string | undefined) ?? null;
            return msg ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {msg}
              </div>
            ) : null;
          }}
        </form.Subscribe>

        <DialogFooter>
          <Button
            disabled={form.state.isSubmitting}
            type="submit"
            form="account-form"
            className="min-w-[120px]"
          >
            {m["accounts.save_changes_action"]()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
