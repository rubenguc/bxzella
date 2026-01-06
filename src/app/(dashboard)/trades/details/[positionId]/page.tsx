"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeInfo } from "@/features/trades/components/trade-info";
import { TradeNotebook } from "@/features/trades/components/trade-notebook";
import { TradePlaybook } from "@/features/trades/components/trades-playbook";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { getTradeByAccountId } from "@/features/trades/services/trades-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformSymbol } from "@/utils/trade-utils";
import { transformTimeToLocalDate } from "@/utils/date-utils";

export default function TradeDetails() {
  const t = useTranslations("trade_info");

  const { positionId } = useParams<{ positionId: string }>();
  const { selectedAccount } = useUserConfigStore();

  const { data } = useQuery({
    queryKey: ["trade-details", positionId],
    queryFn: () =>
      getTradeByAccountId(positionId, { accountId: selectedAccount!._id }),
    enabled: !!selectedAccount?._id,
  });
  const {
    _id = "",
    symbol = "",
    openTime = "",
    updateTime = "",
    playbook = {
      id: "",
      totalRules: 0,
      totalCompletedRules: 0,
      rulesProgress: [],
    },
  } = data || {};
  const formattedSymbol = transformSymbol(symbol);

  const formattedOpenTime = transformTimeToLocalDate(openTime);
  const formattedUpdateTime = transformTimeToLocalDate(updateTime);

  return (
    <div>
      <div className="flex space-x-2 items-center mb-4 bg-card p-2 rounded-xl border">
        <h1 className="font-bold text-2xl">{formattedSymbol}</h1>
        <span className="text-sm text-muted-foreground">
          {formattedOpenTime === formattedUpdateTime
            ? formattedOpenTime
            : `${formattedOpenTime} - ${formattedUpdateTime}`}
        </span>
      </div>
      <div className="flex space-x-4">
        <Tabs className="w-3/10" defaultValue="info">
          <TabsList>
            <TabsTrigger
              value="info"
              className="dark:data-[state=active]:bg-accent dark:data-[state=active]:border-none"
            >
              {t("info")}
            </TabsTrigger>
            <TabsTrigger
              value="playbooks"
              className="dark:data-[state=active]:bg-accent dark:data-[state=active]:border-none"
            >
              {t("playbooks")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="border rounded-xl py-2 px-4">
            <TradeInfo trade={data as TradeDocument} />
          </TabsContent>
          <TabsContent
            value="playbooks"
            className="flex flex-col flex-1 border border-muted rounded-xl py-2 px-4"
          >
            <TradePlaybook tradePlaybook={playbook} tradeId={_id} />
          </TabsContent>
        </Tabs>

        <Card className="w-7/10">
          <CardContent>
            <TradeNotebook tradeId={_id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
