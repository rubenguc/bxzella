import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/use-pagination";
import type { NotebookTemplateDocument } from "../interfaces/notebooks-template-interfaces";
import { getNotebookTemplates } from "../services/notebooks-template-service";

interface NotebookTemplatesListProps {
  onSelectTemplate: (notebookTemplate: NotebookTemplateDocument) => void;
  onCreateNew: () => void;
}

export function NotebookTemplatesList({
  onSelectTemplate,
  onCreateNew,
}: NotebookTemplatesListProps) {
  const t = useTranslations("notebooks.notebook_templates");

  const [searchQuery, setSearchQuery] = useState("");

  const { limit, page } = usePagination({});

  const { data } = useQuery({
    queryKey: ["notebook-templates-list"],
    queryFn: () => getNotebookTemplates({ page, limit }),
  });

  const notebookTemplates = data?.data || [];

  const filteredTemplates = useMemo(
    () =>
      notebookTemplates.filter((template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [notebookTemplates, searchQuery],
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={t("search_templates")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-col flex-1 gap-1 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {searchQuery
              ? t("no_templates_found")
              : t("no_templates_yet")}
          </p>
        ) : (
          filteredTemplates.map((template) => (
            <Button
              variant="ghost"
              key={template._id}
              className="justify-start h-auto py-2 px-3"
              onClick={() => onSelectTemplate(template)}
            >
              <span className="text-left text-sm truncate w-full">
                {template.title}
              </span>
            </Button>
          ))
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        onClick={onCreateNew}
      >
        <Plus className="size-4" />
        {t("create_new_template")}
      </Button>
    </div>
  );
}
