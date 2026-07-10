import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { getNotebookTemplates } from "#/features/notebooks-templates/service";
import type { NotebookTemplate } from "#/features/notebooks-templates/schema";

interface NotebookTemplatesListProps {
  onSelectTemplate: (template: NotebookTemplate) => void;
  onCreateNew: () => void;
}

export function NotebookTemplatesList({
  onSelectTemplate,
  onCreateNew,
}: NotebookTemplatesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["notebook-templates-list"],
    queryFn: () => getNotebookTemplates(0, 50),
  });

  const templates = data?.data || [];

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [templates, searchQuery],
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={m["notebooks.notebook_templates.search_templates"]()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-col flex-1 gap-1 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {searchQuery
              ? m["notebooks.notebook_templates.no_templates_found"]()
              : m["notebooks.notebook_templates.no_templates_yet"]()}
          </p>
        ) : (
          filteredTemplates.map((template) => (
            <Button
              variant="ghost"
              key={template.id}
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
        {m["notebooks.notebook_templates.create_new_template"]()}
      </Button>
    </div>
  );
}
