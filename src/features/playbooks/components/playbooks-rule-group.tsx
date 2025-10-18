import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PlaybookRulesGroup } from "../interfaces/playbooks-interfaces";
import type { PlaybookForm } from "./playbooks-action-dialog";

interface PlaybooksRuleGroupProps extends PlaybookRulesGroup {
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
  groupIndex: number;
  onRemoveGroup: () => void;
  onEditName: () => void;
}

export const PlaybooksRuleGroup = ({
  name,
  rules,
  onAddRule,
  onRemoveRule,
  groupIndex,
  onRemoveGroup,
  onEditName,
}: PlaybooksRuleGroupProps) => {
  const t = useTranslations("playbooks");

  const { register } = useFormContext<PlaybookForm>();

  return (
    <div className="flex flex-col gap-3  bg-white dark:bg-gray-800 border rounded-lg py-2 px-4">
      <div className="flex items-center gap-4">
        <span>{name}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditName}
            className="dark:hover:bg-gray-700"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveGroup}
            className="text-red-500 hover:text-red-700 dark:hover:bg-gray-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
          className="flex items-center gap-2 w-fit dark:hover:bg-gray-700"
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
