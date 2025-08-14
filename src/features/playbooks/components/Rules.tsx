import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext } from "react-hook-form";
import { PlaybookForm } from "./playbooks-action-dialog";
import { RuleGroup } from "./RuleGroup";
import { PlaybooksRuleGroupDialog } from "./playbooks-rule-group-dialog";
import { useToggle } from "react-use";
import { useCallback } from "react";

interface RulesProps {
  error: boolean;
}

export const Rules = ({ error }: RulesProps) => {
  const t = useTranslations("playbooks");
  const { control } = useFormContext<PlaybookForm>();

  const [isDialogOpen, setIsDialogOpen] = useToggle(false);

  const { append, fields, update } = useFieldArray({
    control,
    name: "rulesGroup",
  });

  const createNewRuleGroup = (name: string) => {
    append({
      name,
      rules: [],
    });
  };

  const handleAddRule = useCallback(
    (groupIndex: number) => {
      const updatedGroups = [...fields];
      updatedGroups[groupIndex].rules.push("");
      update(groupIndex, updatedGroups[groupIndex]);
    },
    [fields, update],
  );

  const handleRemoveRule = useCallback(
    (groupIndex: number, ruleIndex: number) => {
      const updatedGroups = [...fields];
      updatedGroups[groupIndex].rules.splice(ruleIndex, 1);
      update(groupIndex, updatedGroups[groupIndex]);
    },
    [fields, update],
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <span>{t("rules")}</span>
        <Button
          className="items-center gap-2"
          type="button"
          onClick={setIsDialogOpen}
        >
          <Plus size={18} /> <span>{t("add_group_rule")}</span>
        </Button>
      </div>
      <div
        className={`border ${error ? "border-destructive" : ""} dark:bg-gray-900 rounded-md min-h-32 overflow-y-scroll p-3 gap-5 flex flex-col`}
      >
        {fields.map((ruleGroup, index) => (
          <RuleGroup
            key={ruleGroup.id}
            {...ruleGroup}
            groupIndex={index}
            onAddRule={() => handleAddRule(index)}
            onRemoveRule={(ruleIndex) => handleRemoveRule(index, ruleIndex)}
          />
        ))}
      </div>

      <PlaybooksRuleGroupDialog
        isDialogOpen={isDialogOpen}
        toggleDialogOpen={setIsDialogOpen}
        createNewRuleGroup={createNewRuleGroup}
      />
    </>
  );
};
