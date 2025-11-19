import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Props {
  isDialogOpen: boolean;
  toggleDialogOpen: (state?: boolean) => void;
  createNewRuleGroup: (name: string) => void;
  initialName?: string;
}

export const PlaybooksRuleGroupDialog = ({
  isDialogOpen,
  toggleDialogOpen,
  createNewRuleGroup,
  initialName = "",
}: Props) => {
  const t = useTranslations("playbooks");

  const [newRuleGroupName, setNewRuleGroupName] = useState("");

  useEffect(() => {
    setNewRuleGroupName(initialName || "");
  }, [initialName]);

  const onContinue = () => {
    createNewRuleGroup(newRuleGroupName);
  };

  const onClose = () => {
    setNewRuleGroupName(initialName);
    toggleDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={toggleDialogOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("rule_name")}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input
            value={newRuleGroupName}
            onChange={(e) => setNewRuleGroupName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onContinue}>
            {t("continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
