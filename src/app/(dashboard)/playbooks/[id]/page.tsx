"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPlaybook } from "@/features/playbooks/services/playbooks-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaybooksOverview } from "@/features/playbooks/components/playbooks-overview";
import { PlaybooksTrades } from "@/features/playbooks/components/playbooks-trades";
import { PlaybooksRulesCompletion } from "@/features/playbooks/components/playbooks-rules-completion";

export default function PlaybookDetailPage() {
  const { selectedAccountId, coin, startDate, endDate } = useUserConfigStore();

  const t = useTranslations("playbook_details");
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["playbook", id, selectedAccountId, coin, startDate, endDate],
    queryFn: () =>
      getPlaybook(id as string, {
        accountId: selectedAccountId,
        startDate: transformDateToParam(startDate!),
        endDate: transformDateToParam(endDate!),
        coin,
      }),
    enabled: !!id && !!selectedAccountId && !!startDate && !!endDate,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!data) {
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
          <CardTitle>{data.playbook?.name}</CardTitle>
          <CardDescription>{data.playbook?.description}</CardDescription>
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
            tradeWin={data.tradeWin || {}}
            avgWinLoss={data.avgWinLoss || {}}
            netPnL={data.netPnL || {}}
            profitFactor={data.profitFactor || {}}
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
