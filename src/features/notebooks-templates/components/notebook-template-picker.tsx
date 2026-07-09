import { useQuery } from "@tanstack/react-query";
import { useState, lazy, Suspense } from "react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { getNotebookTemplates } from "#/features/notebooks-templates/service";
import type { NotebookTemplate } from "#/features/notebooks-templates/schema";

const NotebookTemplatesDialog = lazy(() =>
  import("./notebook-templates-dialog").then((m) => ({
    default: m.NotebookTemplatesDialog,
  })),
);

interface NotebookTemplatePickerProps {
  onSelectTemplate: (template: NotebookTemplate) => void;
}

export function NotebookTemplatePicker({
  onSelectTemplate,
}: NotebookTemplatePickerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: templatesData } = useQuery({
    queryKey: ["notebook-templates-recently"],
    queryFn: () => getNotebookTemplates(0, 5),
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-muted-foreground text-xs">
        {m["notebooks.notebook_templates.recently_used_templates"]()}
      </span>

      {templatesData && templatesData.data.length > 0 ? (
        templatesData.data.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            size="sm"
            onClick={() => onSelectTemplate(template)}
          >
            {template.title}
          </Button>
        ))
      ) : !templatesData ? (
        <Skeleton className="h-7 w-20 rounded-md" />
      ) : null}

      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => setDialogOpen(true)}
      >
        <span className="mr-1">+</span>
        {m["notebooks.notebook_templates.add_template"]()}
      </Button>

      <Suspense fallback={null}>
        <NotebookTemplatesDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onUseTemplate={onSelectTemplate}
        />
      </Suspense>
    </div>
  );
}
