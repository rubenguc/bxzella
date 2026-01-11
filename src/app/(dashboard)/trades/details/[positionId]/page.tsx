"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeInfo } from "@/features/trades/components/trade-info";
import { TradeNotebook } from "@/features/trades/components/trade-notebook";
import { TradePlaybook } from "@/features/trades/components/trades-playbook";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { getTradeByAccountId } from "@/features/trades/services/trades-services";
import type { Coin } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { transformSymbol } from "@/utils/trade-utils";

export default function TradeDetails() {
  const t = useTranslations("trade_info");

  const { positionId } = useParams<{ positionId: string }>();
  const { selectedAccount } = useUserConfigStore();

  const { data, isLoading } = useQuery({
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
    coin,
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

  if (isLoading) return <Spinner className="mx-auto size-6" />;

  if (!data) return <p className="mx-auto">{t("no_trade_data")}</p>;

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
      <div className="flex flex-col md:flex-row gap-4">
        <Tabs className="md:w-3/10" defaultValue="info">
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
          <TabsContent
            value="info"
            className="border rounded-xl py-2 px-4 bg-card"
          >
            <TradeInfo trade={data as TradeDocument} />
          </TabsContent>
          <TabsContent
            value="playbooks"
            className="flex flex-col flex-1 border border-muted rounded-xl py-2 px-4 bg-card"
          >
            <TradePlaybook tradePlaybook={playbook} tradeId={_id} />
          </TabsContent>
        </Tabs>

        <Card className="md:w-7/10 py-3">
          <CardContent className="flex flex-col flex-1 px-3">
            <TradeNotebook tradeId={_id} coin={coin as Coin} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
