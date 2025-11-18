import { useQuery } from "@tanstack/react-query";
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
  const { limit, page } = usePagination({});

  const { data } = useQuery({
    queryKey: ["notebook-templates-list"],
    queryFn: () => getNotebookTemplates({ page, limit }),
  });

  const notebookTemplates = data?.data || [];

  return (
    <div className="flex flex-col space-y-4">
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
  );
}
