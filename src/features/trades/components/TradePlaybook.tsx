import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllPlaybooks } from "@/features/playbooks/hooks/useGetAllPlaybooks";
import { PlaybookDocument } from "@/features/playbooks/interfaces/playbook-interfaces";
import { useState } from "react";
import { TradePlaybook as ITradePlaybook } from "../interfaces/trades-interfaces";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { updateTradePlaybookAction } from "../server/actions/trades-actions";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useToggle } from "react-use";

interface TradePlaybookProps {
  tradePlaybook: ITradePlaybook;
  tradeId: string;
}

export const TradePlaybook = ({
  tradePlaybook,
  tradeId,
}: TradePlaybookProps) => {
  const t = useTranslations("trade_info");

  const [isSaving, toggleSaving] = useToggle(false);

  const [selectedPlaybook, setSelectedPlaybook] =
    useState<ITradePlaybook>(tradePlaybook);
  const { data, isLoading } = useGetAllPlaybooks({ page: 1, limit: 100 });

  const playbooks = data?.data || [];

  const handlePlaybookChange = (playbookId: string) => {
    const playbook = playbooks.find((p) => p._id === playbookId);
    if (!playbook) return;

    setSelectedPlaybook({
      id: playbook._id,
      totalCompletedRules: 0,
      totalRules: 0,
      rulesProgress: playbook.rulesGroup.map((group) => ({
        groupName: group.name,
        completedRules: [],
        totalRules: group.rules.length,
      })),
    });
  };

  const onSavePlaybook = async () => {
    toggleSaving(true);
    try {
      await updateTradePlaybookAction(tradeId, selectedPlaybook);
      // return { error: false, message: "" };
      toast(t("playbook_data_updated"));
    } catch (error) {
      console.error("Error updating playbook:", error);
      // return handleServerActionError("failed_to_create_playbook");
    }
    toggleSaving(false);
  };

  const handleDeletePlaybook = () => {
    setSelectedPlaybook({
      id: null,
      totalCompletedRules: 0,
      totalRules: 0,
      rulesProgress: [],
    });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2">
        <Select
          value={selectedPlaybook?.id || ""}
          defaultValue={selectedPlaybook?.id || ""}
          onValueChange={handlePlaybookChange}
        >
          <SelectTrigger className="w-fit">
            <SelectValue
              data-slot="select-playbook"
              placeholder="Select a playbook"
            />
          </SelectTrigger>
          <SelectContent>
            {playbooks.map((playbook: PlaybookDocument) => (
              <SelectItem key={playbook._id} value={playbook._id}>
                {playbook.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={handleDeletePlaybook}>
          <Trash className="text-destructive" />
        </Button>
      </div>
      <div className="flex-1"></div>
      <div className="flex justify-end">
        <Button disabled={isSaving} onClick={onSavePlaybook}>
          {t("save_changes")}
        </Button>
      </div>
    </div>
  );
};
