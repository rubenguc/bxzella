import { useCallback, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-store";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, NotebookText } from "lucide-react";

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
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { FieldError } from "#/components/form/field-error";
import { COIN_LABELS, PROVIDER_INFO } from "#/features/exchange-providers/types";
import { getCoinsForProvider } from "#/features/exchange-providers/coins";
import type {
  SubscriptionWithAccount,
} from "#/features/ai-summary-subscriptions/types";
import {
  createSubscriptionSchema,
  type CreateSubscriptionForm,
} from "#/features/ai-summary-subscriptions/validation";
import { createSubscriptionAction } from "#/features/ai-summary-subscriptions/server-actions";
import { useGetAccounts } from "#/features/exchange-accounts/hooks/use-exchange-accounts";



interface Props {
  currentRow?: SubscriptionWithAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Map server-action error keys to i18n message keys */
const errorMessages: Record<string, string> = {
  invalid_subscription_data: "ai_summary.invalid_subscription_data",
  subscription_already_exists: "ai_summary.subscription_already_exists",
  server_error: "errors.server_error",
  unauthorized: "errors.server_error",
};

function translateError(error: string): string {
  const key = errorMessages[error] ?? "errors.server_error";
  return (m as Record<string, () => string>)[key]?.() ?? error;
}

export function SubscriptionActionDialog({
  currentRow: _currentRow,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useGetAccounts();

  const accountsMap = useMemo(
    () => Object.fromEntries((accounts ?? []).map((a) => [a.id, a])),
    [accounts],
  );

  const form = useForm({
    defaultValues: {
      accountId: "",
      coin: "USDT" as "USDT" | "VST" | "USDC",
      includeNotebook: true,
    },
    validators: {
      onSubmit: createSubscriptionSchema as any,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await createSubscriptionAction({ data: value });

      if (!result.success) {
        formApi.setErrorMap({
          onSubmit: { form: translateError(result.error), fields: {} },
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["ai-summary-subscriptions"],
      });
      form.reset();
      onOpenChange(false);
    },
  });

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

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
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            {m["ai_summary.add_new_subscription"]()}
          </DialogTitle>
          <DialogDescription>
            {m["ai_summary.add_description"]()}
          </DialogDescription>
        </DialogHeader>

        <form
          id="subscription-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Account */}
          <form.Field name="accountId">
            {(field) => {
              const selectedAccount = field.state.value
                ? accountsMap[field.state.value]
                : null;

              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>
                    {m["ai_summary.account"]()}
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => {
                      field.handleChange(v);
                      // Reset coin if current coin isn't available for the new provider
                      const account = accountsMap[v];
                      if (account) {
                        const available = getCoinsForProvider(account.provider);
                        form.setFieldValue("coin", available[0] as CreateSubscriptionForm["coin"]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={m["ai_summary.select_account"]()}
                      >
                        {selectedAccount && (
                          <div className="flex items-center gap-2">
                            <img
                              src={PROVIDER_INFO[selectedAccount.provider].image}
                              alt={selectedAccount.provider}
                              width={20}
                              height={20}
                              className="rounded-full object-cover shrink-0"
                            />
                            <span>{selectedAccount.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={PROVIDER_INFO[account.provider].image}
                              alt={account.provider}
                              width={20}
                              height={20}
                              className="rounded-full object-cover shrink-0"
                            />
                            <span>{account.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError error={field.state.meta.errors?.[0]} />
                </div>
              );
            }}
          </form.Field>

          {/* Coin */}
          <form.Field name="coin">
            {(field) => {
              const selectedAccount = form.getFieldValue("accountId")
                ? accountsMap[form.getFieldValue("accountId")]
                : null;
              const availableCoins = getCoinsForProvider(
                selectedAccount?.provider,
              );

              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>
                    {m["ai_summary.coin"]()}
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) =>
                      field.handleChange(v as CreateSubscriptionForm["coin"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={m["ai_summary.select_coin"]()}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCoins.map((coin) => (
                        <SelectItem key={coin} value={coin}>
                          <div className="flex items-center gap-2">
                            <img
                              src={`/assets/coins/${coin}.webp`}
                              alt={coin}
                              width={20}
                              height={20}
                              className="rounded-full object-cover shrink-0"
                            />
                            <span>{COIN_LABELS[coin]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError error={field.state.meta.errors?.[0]} />
                </div>
              );
            }}
          </form.Field>

          {/* Include Notebook */}
          <form.Field name="includeNotebook">
            {(field) => (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <NotebookText className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      {m["ai_summary.include_notebook"]()}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {m["ai_summary.include_notebook_description"]()}
                    </p>
                  </div>
                </div>
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(v) => field.handleChange(v)}
                />
              </div>
            )}
          </form.Field>
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
            disabled={isSubmitting}
            type="submit"
            form="subscription-form"
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {m["ai_summary.saving_action"]()}
              </>
            ) : (
              m["ai_summary.create_action"]()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
