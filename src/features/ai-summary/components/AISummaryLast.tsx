import { useUserConfigStore } from "@/store/user-config-store";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getLastAISummary } from "../services/ai-summary-services";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AISummaryLoadingSkeleton } from "./AISummaryLoadingSkeleton";

export function AISummaryLast() {
  const t = useTranslations("ai_summary");
  const { selectedAccountId, coin } = useUserConfigStore();

  const { data, isLoading } = useQuery({
    queryKey: ["ai-summary-last", selectedAccountId, coin],
    queryFn: () =>
      getLastAISummary({
        accountId: selectedAccountId,
        coin,
      }),
    enabled: !!selectedAccountId,
  });

  const summary = data?.summary || {};

  if (!data || isLoading) return <AISummaryLoadingSkeleton />;

  if (!isLoading && Object.keys(summary).length === 0)
    return (
      <>
        <h3 className="mt-10 text-xl font-bold">
          {t("no_week_data_to_summarize")}
        </h3>
        <p className="mt-3 text-gray-300">
          {t("no_week_data_to_summarize_description")}
        </p>
      </>
    );

  return (
    <div className="flex flex-col">
      <p className="text-xl">
        {t("last_summary")} ({transformTimeToLocalDate(summary.startDate)} -{" "}
        {transformTimeToLocalDate(summary.endDate)})
      </p>
      <div className="[&>h2]:mb-3 [&>h2]:font-bold [&>ul]:list-disc [&>ol]:list-disc [&>ol]:pl-7 [&>ul]:pl-7 [&>ul]:mb-5  [&>p:first-of-type]:mb-4 [&>p:first-of-type]:text-gray-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {summary.result}
        </ReactMarkdown>
      </div>
    </div>
  );
}
