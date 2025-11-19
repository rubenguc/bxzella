import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useToggle } from "react-use";
import { Button } from "@/components/ui/button";
import type { PlaybookForm } from "./playbooks-action-dialog";
import { PlaybooksRuleGroup } from "./playbooks-rule-group";
import { PlaybooksRuleGroupDialog } from "./playbooks-rule-group-dialog";

interface PlaybooksRulesProps {
  error: boolean;
}

export const PlaybooksRules = ({ error }: PlaybooksRulesProps) => {
  const t = useTranslations("playbooks");
  const { control } = useFormContext<PlaybookForm>();

  const [isDialogOpen, setIsDialogOpen] = useToggle(false);
  const [selectedRule, setSelectedRule] = useState<{
    index: number;
    name: string;
  } | null>(null);

  const { append, fields, update, remove } = useFieldArray({
    control,
    name: "rulesGroup",
  });

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

  const handleEditRuleName = (name: string) => {
    if (selectedRule !== null) {
      const updatedGroup = { ...fields[selectedRule.index], name };
      update(selectedRule.index, updatedGroup);
      setSelectedRule(null);
    } else {
      append({
        name,
        rules: [],
      });
    }
    setIsDialogOpen(false);
  };

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
        className={`border ${error ? "border-destructive" : ""} bg-slate-50  dark:bg-gray-900 rounded-md min-h-32 overflow-y-scroll p-3 gap-5 flex flex-col`}
      >
        {fields.map((ruleGroup, index) => (
          <PlaybooksRuleGroup
            key={ruleGroup.id}
            {...ruleGroup}
            groupIndex={index}
            onAddRule={() => handleAddRule(index)}
            onRemoveRule={(ruleIndex) => handleRemoveRule(index, ruleIndex)}
            onRemoveGroup={() => remove(index)}
            onEditName={() => {
              setSelectedRule({ index, name: ruleGroup.name });
              setIsDialogOpen(true);
            }}
          />
        ))}
      </div>

      <PlaybooksRuleGroupDialog
        isDialogOpen={isDialogOpen}
        toggleDialogOpen={setIsDialogOpen}
        createNewRuleGroup={handleEditRuleName}
        initialName={selectedRule?.name || ""}
      />
    </>
  );
};
