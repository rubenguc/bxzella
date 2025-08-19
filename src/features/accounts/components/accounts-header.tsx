import { Button } from "@/components/ui/button";
import { useAccounts } from "@/features/accounts/context/accounts-context";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function AccountsHeader() {
  const t = useTranslations("accounts");
  const { setOpen } = useAccounts();

  return (
    <div className="mb-2 flex flex-wrap items-center justify-end space-y-2">
      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <span>{t("add_account")}</span> <Plus size={18} />
      </Button>
    </div>
  );
}
