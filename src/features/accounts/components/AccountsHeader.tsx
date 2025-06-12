import { Button } from "@/components/ui/button";
import { useAccounts } from "../context/accounts-context";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function AccountsHeader() {
  const t = useTranslations("accounts");
  const { setOpen } = useAccounts();

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("header")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <span>{t("add_account")}</span> <Plus size={18} />
      </Button>
    </div>
  );
}
