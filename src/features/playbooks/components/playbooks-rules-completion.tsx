import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { Card } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";
import { getRulesCompletionByPlaybookId } from "../services/playbooks-services";

interface PlaybooksRulesCompletionProps {
  id: string;
}

export function PlaybooksRulesCompletion({
  id,
}: PlaybooksRulesCompletionProps) {
  const t = useTranslations("playbook_details.playbook_rules");

  const { selectedAccountId, coin, startDate, endDate } = useUserConfigStore();

  const { data } = useQuery({
    queryKey: ["playbooks-rules-completion"],
    queryFn: () =>
      getRulesCompletionByPlaybookId({
        playbookId: id,
        accountId: selectedAccountId,
        coin,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
      }),
  });

  const _data = data?.rulesGroupCompletion ?? [];

  return (
    <Card className="py-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("follow_rate")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {_data.map((group) => (
            <Fragment key={group.name}>
              <TableRow>
                <TableCell colSpan={3}>{group.name}</TableCell>
              </TableRow>

              {group.rules.map((rule, idx) => (
                <TableRow
                  key={`${group.name}-${idx}`}
                  className="border-b hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">{rule.name}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <div
                      className={
                        rule.completionPercentage > 50
                          ? "text-green-600 font-medium"
                          : "text-red-500"
                      }
                    >
                      {rule.completionPercentage.toFixed(2)}%
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
