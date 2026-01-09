import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePagination } from "@/hooks/use-pagination";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { useNotebookFoldersContext } from "../context/notebook-folders-context";
import { useNotebooksContext } from "../context/notebooks-context";
import { getNotebooksByFolderId } from "../services/notebooks-services";
import { getNotebookTitle } from "../utils/notebooks-utils";

export function NotebooksList() {
  const t = useTranslations("notebooks.notebooks");
  const { selectedNotebookFolder } = useNotebookFoldersContext();

  const { selectedNotebook, setSelectedNotebook } = useNotebooksContext();

  const { limit, page } = usePagination();

  const folderId = selectedNotebookFolder?._id ?? "all";

  const { data, isLoading } = useQuery({
    queryKey: ["notebooks-by-folder-id", folderId],
    queryFn: () =>
      getNotebooksByFolderId(folderId, {
        limit,
        page,
      }),
  });

  const notebooks = data?.data || [];

  return (
    <div className="border-b md:border-r md:border-b-0 border-accent md:w-1/5">
      {isLoading && <Spinner className="mx-auto" />}

      {!isLoading && notebooks.length === 0 && (
        <span className="text-center text-xs block text-muted-foreground">
          {t("no_notebooks_to_show")}
        </span>
      )}

      <div className="flex md:flex-col gap-2 justify-start px-1 overflow-scroll">
        {notebooks.map((notebook) => (
          <Button
            variant="ghost"
            key={notebook._id}
            className={`flex flex-col items-start py-8 gap-0 border-r    md:border-r-0  md:border-b border-accent rounded-none hover:bg-accent dark:hover:bg-accent/50 ${selectedNotebook?._id === notebook._id ? "bg-accent dark:bg-accent/50" : ""}`}
            onClick={() => setSelectedNotebook(notebook)}
          >
            <span className="font-bold">{getNotebookTitle(notebook)}</span>
            <span className="texte-xs text-muted-foreground">
              {transformTimeToLocalDate(notebook.updatedAt as Date)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
