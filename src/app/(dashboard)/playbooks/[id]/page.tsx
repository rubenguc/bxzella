"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaybooksOverview } from "@/features/playbooks/components/playbooks-overview";
import { PlaybooksRulesCompletion } from "@/features/playbooks/components/playbooks-rules-completion";
import { PlaybooksTrades } from "@/features/playbooks/components/playbooks-trades";
import type { PlaybookTradeStatistics } from "@/features/playbooks/interfaces/playbooks-interfaces";
import { getPlaybook } from "@/features/playbooks/services/playbooks-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";

export default function PlaybookDetailPage() {
  const { selectedAccountId, coin, startDate, endDate } = useUserConfigStore();

  const t = useTranslations("playbook_details");
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["playbook", id, selectedAccountId, coin, startDate, endDate],
    queryFn: () =>
      getPlaybook({
        playbookId: id,
        accountId: selectedAccountId,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        coin,
      }),
    enabled: !!id && !!selectedAccountId && !!startDate && !!endDate,
  });

  const playbookInfo = data?.data || ({} as PlaybookTradeStatistics);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t("playbook_not_found")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{playbookInfo.playbook?.name}</CardTitle>
          <CardDescription>
            {playbookInfo.playbook?.description}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="playbook_rules">
            {t("tabs.playbook_rules")}
          </TabsTrigger>
          <TabsTrigger value="trades">{t("tabs.trades")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <PlaybooksOverview
            tradeWin={playbookInfo.tradeWin || {}}
            avgWinLoss={playbookInfo.avgWinLoss || {}}
            netPnL={playbookInfo.netPnL || {}}
            profitFactor={playbookInfo.profitFactor || {}}
          />
        </TabsContent>
        <TabsContent value="playbook_rules">
          <PlaybooksRulesCompletion id={id} />
        </TabsContent>
        <TabsContent value="trades">
          <PlaybooksTrades id={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
