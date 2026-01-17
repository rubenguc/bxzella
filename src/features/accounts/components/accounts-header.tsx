import { Plus } from "lucide-react";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/features/accounts/context/accounts-context";

export function AccountsHeader() {
  const t = useTranslations("accounts");
  const tCommon = useTranslationsCommon("common_messages");
  const { setOpen } = useAccounts();

  return (
    <div className="mb-2 flex flex-wrap items-center justify-end space-y-2">
      <Button
        className="space-x-1"
        onClick={() => setOpen("add")}
        aria-label={tCommon("aria_add", { item: t("add_account") })}
      >
        <span>{t("add_account")}</span> <Plus size={18} />
      </Button>
    </div>
  );
}
