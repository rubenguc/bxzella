import { useTranslations } from "next-intl";
import { useState } from "react";
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
}

export const PlaybooksRuleGroupDialog = ({
  isDialogOpen,
  toggleDialogOpen,
  createNewRuleGroup,
}: Props) => {
  const t = useTranslations("playbooks");

  const [newRuleGroupName, setNewRuleGroupName] = useState("");

  const onContinue = () => {
    setNewRuleGroupName("");

    createNewRuleGroup(newRuleGroupName);
    onClose();
  };

  const onClose = () => {
    setNewRuleGroupName("");
    toggleDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("add_group_rule")}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input
            value={newRuleGroupName}
            onChange={(e) => setNewRuleGroupName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
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
