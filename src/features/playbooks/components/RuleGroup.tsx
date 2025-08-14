import { useTranslations } from "next-intl";
import { PlaybookRulesGroup } from "../interfaces/playbook-interfaces";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { PlaybookForm } from "./playbooks-action-dialog";

interface RuleGroupProps extends PlaybookRulesGroup {
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
  groupIndex: number;
}

export const RuleGroup = ({
  name,
  rules,
  onAddRule,
  onRemoveRule,
  groupIndex,
}: RuleGroupProps) => {
  const t = useTranslations("playbooks");

  const { register } = useFormContext<PlaybookForm>();

  return (
    <div className="flex flex-col gap-3 dark:bg-gray-500 rounded-lg py-2 px-4">
      <span>{name}</span>

      <div className="flex flex-col gap-2">
        {rules.map((rule, index) => (
          <div
            key={`${rule}-${index}`}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center w-full">
              <GripVertical className="w-4 h-4 text-gray-400 mr-3" />
              <Input
                className="border"
                {...register(`rulesGroup.${groupIndex}.rules.${index}`)}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveRule(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="ghost"
          className="flex items-center gap-2 w-fit"
          size="sm"
          type="button"
          onClick={onAddRule}
        >
          <Plus />
          <span>{t("add_rule")}</span>
        </Button>
      </div>
    </div>
  );
};
