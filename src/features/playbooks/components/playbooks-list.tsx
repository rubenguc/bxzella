import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePagination } from "@/hooks/use-pagination";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";
import { usePlaybooks } from "../context/playbooks-context";
import type { PlaybookDocument } from "../interfaces/playbooks-interfaces";
import { getPlaybooks } from "../services/playbooks-services";
import { PlaybookListSkeleton } from "./playbooks-list-skeleton";

export function PlaybooksList() {
  const t = useTranslations("playbooks");
  const tStatistics = useTranslations("statistics");
  const router = useRouter();

  const { setOpen, setCurrentRow } = usePlaybooks();
  const { selectedAccount, coin, startDate, endDate } = useUserConfigStore();

  const { limit, page } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: [
      "playbooks",
      selectedAccount?._id,
      limit,
      page,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getPlaybooks({
        accountId: selectedAccount!._id,
        page,
        limit,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        coin,
      }),
    enabled: !!selectedAccount?._id && !!startDate && !!endDate,
  });

  const playbooks = data?.data || [];

  const showSkeleton = isLoading && !!data;

  if (showSkeleton) {
    return <PlaybookListSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {playbooks.map(
        ({ playbook, avgWinLoss, netPnL, profitFactor, tradeWin }) => (
          <Card key={playbook._id}>
            <CardHeader>
              <CardTitle>
                {playbook.icon} {playbook.name}
              </CardTitle>
              <CardDescription>
                {`${netPnL.totalTrades} ${t("trades")}`}
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
                        setCurrentRow(playbook as PlaybookDocument);
                        setOpen("edit");
                      }}
                    >
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setCurrentRow(playbook as PlaybookDocument);
                        setOpen("delete");
                      }}
                    >
                      {t("delete")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(`/playbooks/${playbook._id}`);
                      }}
                    >
                      {t("see_details")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 space-y-3.5">
                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-3">
                    {tStatistics("win_rate")}
                  </span>
                  <span>{formatDecimal(tradeWin.value)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-3">
                    {tStatistics("net_pnl")}
                  </span>
                  <span className={getResultClass(netPnL.value)}>
                    {formatDecimal(netPnL.value)} {coin}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-3">
                    {tStatistics("average_win")}
                  </span>
                  <span>
                    {formatDecimal(avgWinLoss.avgWin)} {coin}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-3">
                    {tStatistics("average_loss")}
                  </span>
                  <span>
                    {formatDecimal(avgWinLoss.avgLoss)} {coin}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-3">
                    {tStatistics("profit_factor")}
                  </span>
                  <span>{formatDecimal(profitFactor.value)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-muted-foreground">
              {playbook.description}
            </CardFooter>
          </Card>
        ),
      )}
    </div>
  );
}
