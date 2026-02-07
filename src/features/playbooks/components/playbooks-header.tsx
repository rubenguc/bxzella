import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePlaybooks } from "../context/playbooks-context";

export function PlaybooksHeader() {
  const t = useTranslations("playbooks");
  const { setOpen } = usePlaybooks();

  return (
    <div className="mb-2 flex flex-wrap items-center justify-end space-y-2">
      <Button
        className="space-x-1"
        onClick={() => setOpen("add")}
        aria-label={t("add_playbook")}
      >
        <Plus size={18} /> <span>{t("add_playbook")}</span>
      </Button>
    </div>
  );
}
