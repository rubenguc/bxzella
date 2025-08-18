"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AISummaryDialog } from "@/features/ai-summary/components/AISummaryDialog";
import { AISummaryLast } from "@/features/ai-summary/components/AISummaryLast";
import { AISummaryTable } from "@/features/ai-summary/components/AISummaryTable";
import AISummaryProvider from "@/features/ai-summary/context/ai-summary-context";
import { useTranslations } from "next-intl";

export default function AISummary() {
  const t = useTranslations("ai_summary");

  return (
    <AISummaryProvider>
      <Tabs defaultValue="last" className="mt-4">
        <TabsList className="bg-transparent border-b w-full">
          <TabsTrigger value="last">{t("last")}</TabsTrigger>
          <TabsTrigger value="all">{t("all")}</TabsTrigger>
        </TabsList>
        <TabsContent value="last">
          <AISummaryLast />
        </TabsContent>
        <TabsContent value="all">
          <AISummaryTable />
        </TabsContent>
      </Tabs>
      <AISummaryDialog />
    </AISummaryProvider>
  );
}
