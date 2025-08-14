import { useTranslations } from "next-intl";
import { usePlaybooks } from "../context/playbooks-context";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserConfigStore } from "@/store/user-config-store";
import { getPlaybooks } from "../services/playbooks-services";
import { transformDateToParam } from "@/utils/date-utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PlaybooksList() {
  const t = useTranslations("playbooks");
  const tStatistics = useTranslations("statistics");

  const { setOpen, setCurrentRow } = usePlaybooks();
  const { selectedAccountId, coin, startDate, endDate } = useUserConfigStore();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "playbooks",
      selectedAccountId,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      getPlaybooks({
        accountId: selectedAccountId,
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        startDate: transformDateToParam(startDate!),
        endDate: transformDateToParam(endDate!),
        coin,
      }),
    enabled: !!selectedAccountId && !!startDate && !!endDate,
  });

  const playbooks = data?.data || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {playbooks.map((playbook) => (
        <Card key={playbook._id}>
          <CardHeader>
            <CardTitle>
              {playbook.icon} {playbook.name}
            </CardTitle>
            <CardDescription>
              {`${playbook.totalTrades} ${t("trades")}`}
            </CardDescription>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <Menu />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setCurrentRow(playbook);
                      setOpen("edit");
                    }}
                  >
                    {t("edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setCurrentRow(playbook);
                      setOpen("delete");
                    }}
                  >
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 space-y-3.5">
              <div className="flex flex-col">
                <span className="dark:text-gray-300 text-sm leading-3">
                  {tStatistics("win_rate")}
                </span>
                <span>{formatDecimal(playbook.tradeWinPercent)}</span>
              </div>
              <div className="flex flex-col">
                <span className="dark:text-gray-300 text-sm leading-3">
                  {tStatistics("net_pnl")}
                </span>
                <span className={getResultClass(playbook.netPnL)}>
                  {formatDecimal(playbook.netPnL)} {coin}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="dark:text-gray-300 text-sm leading-3">
                  {tStatistics("average_win")}
                </span>
                <span>
                  {formatDecimal(playbook.avgWin)} {coin}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="dark:text-gray-300 text-sm leading-3">
                  {tStatistics("average_loss")}
                </span>
                <span>
                  {formatDecimal(playbook.avgLoss)} {coin}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="dark:text-gray-300 text-sm leading-3">
                  {tStatistics("profit_factor")}
                </span>
                <span>
                  {formatDecimal(playbook.profitFactor)} {coin}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="dark:text-gray-400">
            {playbook.description}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
