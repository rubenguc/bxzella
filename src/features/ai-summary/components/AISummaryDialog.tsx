import { useTranslations } from "next-intl";
import { useAISummaryContext } from "@/features/ai-summary/context/ai-summary-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AISummaryDialog() {
  const t = useTranslations("ai_summary");
  const { isOpen, currentAISummary, setCurrentAISummary } =
    useAISummaryContext();

  const { startDate, endDate, result, model } = currentAISummary || {};

  return (
    <Dialog open={isOpen} onOpenChange={() => setCurrentAISummary(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-5 text-2xl">
            {t("summary")} ({transformTimeToLocalDate(startDate || "")} -{" "}
            {transformTimeToLocalDate(endDate || "")})
          </DialogTitle>
          <DialogDescription>
            {t("model")}: {model}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
          <div className="[&>h2]:mb-3 [&>h2]:font-bold [&>ul]:list-disc [&>ol]:list-disc [&>ol]:pl-7 [&>ul]:pl-7 [&>ul]:mb-5  [&>p:first-of-type]:mb-4 [&>p:first-of-type]:text-gray-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
