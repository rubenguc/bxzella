import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToggle } from "react-use";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePagination } from "@/hooks/use-pagination";
import type { NotebookTemplateDocument } from "../interfaces/notebooks-template-interfaces";
import { getNotebookTemplates } from "../services/notebooks-template-service";
import { NotebookTemplatesDialog } from "./notebook-templates-dialog";

interface NotebookTemplatesRecentlyListProps {
  onSelectTemplate: (notebookTemplate: NotebookTemplateDocument) => void;
}

export const NotebookTemplatesRecentlyList = ({
  onSelectTemplate,
}: NotebookTemplatesRecentlyListProps) => {
  const t = useTranslations("notebooks.notebook_templates");

  const { limit, page } = usePagination({});

  const { data, isLoading } = useQuery({
    queryKey: ["notebook-templates-recently"],
    queryFn: () => getNotebookTemplates({ page, limit }),
  });

  const [isOpen, toggle] = useToggle(false);

  const notebookTemplates = data?.data || [];

  return (
    <>
      <div className="flex items-center gap-2 flex-nowrap">
        <span className="text-muted-foreground text-sm">
          {t("recently_used_templates")}
        </span>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {notebookTemplates.map((notebookTemplate) => (
              <Button
                variant="outline"
                size="sm"
                key={notebookTemplate._id}
                onClick={() => onSelectTemplate(notebookTemplate)}
              >
                {notebookTemplate.title}
              </Button>
            ))}
            <Button
              className="text-xs"
              variant="outline"
              size="sm"
              onClick={toggle}
            >
              <Plus />
              <span>{t("add_template")}</span>
            </Button>
          </>
        )}
      </div>

      <NotebookTemplatesDialog open={isOpen} onClose={toggle} />
    </>
  );
};
