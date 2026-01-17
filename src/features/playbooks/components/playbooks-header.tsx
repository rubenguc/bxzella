import { Plus } from "lucide-react";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { Button } from "@/components/ui/button";
import { usePlaybooks } from "../context/playbooks-context";

export function PlaybooksHeader() {
  const t = useTranslations("playbooks");
  const tCommon = useTranslationsCommon("common_messages");
  const { setOpen } = usePlaybooks();

  return (
    <div className="mb-2 flex flex-wrap items-center justify-end space-y-2">
      <Button
        className="space-x-1"
        onClick={() => setOpen("add")}
        aria-label={tCommon("aria_add", { item: t("add_playbook") })}
      >
        <Plus size={18} /> <span>{t("add_playbook")}</span>
      </Button>
    </div>
  );
}
