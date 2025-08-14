import { useTranslations } from "next-intl";
import { usePlaybooks } from "../context/playbooks-context";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function PlaybooksHeader() {
  const t = useTranslations("playbooks");
  const { setOpen } = usePlaybooks();

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("header")}</h2>
        <p className="text-muted-foreground">{t("header_description")}</p>
      </div>
      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <Plus size={18} /> <span>{t("add_playbook")}</span>
      </Button>
    </div>
  );
}
