import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import type { NotebookTemplateDocument } from "../interfaces/notebooks-template-interfaces";
import { getNotebookTemplates } from "../services/notebooks-template-service";

interface NotebookTemplatesListProps {
  onSelectTemplate: (notebookTemplate: NotebookTemplateDocument) => void;
}

export function NotebookTemplatesList({
  onSelectTemplate,
}: NotebookTemplatesListProps) {
  const t = useTranslations("notebooks.notebook_templates");

  const { limit, page } = usePagination({});

  const { data } = useQuery({
    queryKey: ["notebook-templates-list"],
    queryFn: () => getNotebookTemplates({ page, limit }),
  });

  const notebookTemplates = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-muted-foreground">{t("templates")}</h3>
      <div className="flex flex-col flex-1 space-y-4 ">
        {notebookTemplates.map((notebookTemplete) => (
          <Button
            variant="ghost"
            key={notebookTemplete._id}
            className="space-y-2 justify-start"
            onClick={() => onSelectTemplate(notebookTemplete)}
          >
            {notebookTemplete.title}
          </Button>
        ))}
      </div>
      <Button
        onClick={() =>
          onSelectTemplate({
            title: "",
            content: "",
          } as NotebookTemplateDocument)
        }
      >
        {t("new_template")}
      </Button>
    </div>
  );
}
