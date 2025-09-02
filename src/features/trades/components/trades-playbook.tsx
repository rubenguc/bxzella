import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllPlaybooks } from "@/features/playbooks/hooks/useGetAllPlaybooks";
import { PlaybookDocument } from "@/features/playbooks/interfaces/playbooks-interfaces";
import { useState, useMemo } from "react";
import { TradePlaybook as ITradePlaybook } from "../interfaces/trades-interfaces";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { updateTradePlaybookAction } from "../server/actions/trades-actions";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useToggle } from "react-use";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import { useUserConfigStore } from "@/store/user-config-store";

interface TradePlaybookProps {
  tradePlaybook: ITradePlaybook;
  tradeId: string;
}

export const TradePlaybook = ({
  tradePlaybook,
  tradeId,
}: TradePlaybookProps) => {
  const t = useTranslations("trade_info");
  const { selectedAccountId } = useUserConfigStore();

  const queryClient = useQueryClient();

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
      rulesProgress: playbook.rulesGroup.map((group) => ({
        groupName: group.name,
        rules: group.rules.map((rule) => ({
          name: rule,
          isCompleted: false,
        })),
      })),
    });
  };

  const handleRuleCompletion = (ruleName: string, completed: boolean) => {
    setSelectedPlaybook((prevState) => {
      if (!prevState) return prevState;

      // Check if the rule state is actually changing
      const ruleGroup = prevState.rulesProgress.find((group) =>
        group.rules.some((rule) => rule.name === ruleName),
      );

      const rule = ruleGroup?.rules.find((rule) => rule.name === ruleName);
      if (rule && rule.isCompleted === completed) {
        // No change needed
        return prevState;
      }

      return {
        ...prevState,
        rulesProgress: prevState.rulesProgress.map((group) => ({
          ...group,
          rules: group.rules.map((rule) =>
            rule.name === ruleName ? { ...rule, isCompleted: completed } : rule,
          ),
        })),
      };
    });
  };

  const onSavePlaybook = async () => {
    toggleSaving(true);
    try {
      const response = await updateTradePlaybookAction(
        tradeId,
        selectedPlaybook,
      );

      if (response?.error) {
        toast.error(response.message);
        return;
      }

      // @ts-expect-error ** response
      if (response.isUpdated) {
        queryClient.invalidateQueries({
          queryKey: ["all-trades", selectedAccountId],
        });
      }

      toast(t("playbook_data_updated"));
    } catch (error) {
      console.error("Error updating playbook:", error);
    }
    toggleSaving(false);
  };

  const handleDeletePlaybook = () => {
    setSelectedPlaybook({
      id: null,
      rulesProgress: [],
    });
  };

  const checkAllRules = () => {
    setSelectedPlaybook((prev) => {
      if (!prev?.rulesProgress) return prev;

      const updatedRulesProgress = prev.rulesProgress.map((group) => ({
        ...group,
        rules: group.rules.map((rule) => ({ ...rule, isCompleted: true })),
      }));

      return {
        ...prev,
        rulesProgress: updatedRulesProgress,
      };
    });
  };

  const { totalRules, completedRules, progressPercentage } = useMemo(() => {
    if (!selectedPlaybook?.rulesProgress) {
      return { totalRules: 0, completedRules: 0, progressPercentage: 0 };
    }

    const total = selectedPlaybook.rulesProgress.reduce((acc, group) => {
      return acc + group.rules.length;
    }, 0);

    const completed = selectedPlaybook.rulesProgress.reduce((acc, group) => {
      return acc + group.rules.filter((rule) => rule.isCompleted).length;
    }, 0);

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalRules: total,
      completedRules: completed,
      progressPercentage: percentage,
    };
  }, [selectedPlaybook]);

  return (
    <div className="flex flex-col flex-1 mt-2">
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

      <div className="flex flex-col gap-2 mt-3 flex-1">
        {selectedPlaybook?.id && (
          <>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("rules_followed")}</span>
                <Button variant="ghost" onClick={checkAllRules}>
                  {t("check_all")}
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Progress
                  value={progressPercentage}
                  className="[&>*]:bg-green-500"
                />
                <span className="tracking-widest text-sm">
                  {completedRules}/{totalRules}
                </span>
              </div>
            </div>
            <Separator className="my-2.5" />
            <div className="flex flex-col gap-3">
              {selectedPlaybook?.rulesProgress.map((ruleGroup) => (
                <div key={ruleGroup.groupName}>
                  <span className="text-gray-300 mb-2">
                    {ruleGroup.groupName}
                  </span>
                  {ruleGroup.rules.map((rule) => (
                    <div key={rule.name} className="flex items-center gap-2">
                      <Checkbox
                        checked={rule.isCompleted}
                        onCheckedChange={(checked) =>
                          handleRuleCompletion(rule.name, checked as boolean)
                        }
                      />
                      <span>{rule.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end">
        <Button disabled={isSaving || isLoading} onClick={onSavePlaybook}>
          {t("save_changes")}
        </Button>
      </div>
    </div>
  );
};
