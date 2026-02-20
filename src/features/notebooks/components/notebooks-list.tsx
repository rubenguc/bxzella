import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePagination } from "@/hooks/use-pagination";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { useNotebookFoldersContext } from "../context/notebook-folders-context";
import { useNotebooksContext } from "../context/notebooks-context";
import { getNotebooksByFolderId } from "../services/notebooks-services";
import { getNotebookTitle } from "../utils/notebooks-utils";
import { useUserConfigStore } from "@/store/user-config-store";

export function NotebooksList() {
  const t = useTranslations("notebooks.notebooks");

  const { coin } = useUserConfigStore();
  const { selectedNotebookFolder } = useNotebookFoldersContext();
  const { selectedNotebook, setSelectedNotebook } = useNotebooksContext();

  const { limit, page } = usePagination();

  const folderId = selectedNotebookFolder?._id ?? "all";

  const { data, isLoading } = useQuery({
    queryKey: ["notebooks-by-folder-id", folderId, coin],
    queryFn: () =>
      getNotebooksByFolderId(folderId, {
        limit,
        page,
        coin,
      }),
    enabled: !!folderId && !!coin,
  });

  const notebooks = data?.data || [];

  return (
    <div className="border-b md:border-r md:border-b-0 border-border/50 md:w-1/5 bg-muted/20">
      {isLoading && <Spinner className="mx-auto my-4" />}

      {!isLoading && notebooks.length === 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs block text-muted-foreground py-8"
        >
          {t("no_notebooks_to_show")}
        </motion.span>
      )}

      <div className="flex md:flex-col gap-2 justify-start px-2 py-3 overflow-scroll">
        {notebooks.map((notebook, index) => (
          <motion.div
            key={notebook._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Button
              variant="ghost"
              className={`flex flex-col items-start py-4 px-3 gap-1 border-r md:border-r-0 md:border-b border-border/50 rounded-lg hover:bg-accent/50 dark:hover:bg-accent/30 transition-all duration-200 w-full justify-start ${
                selectedNotebook?._id === notebook._id
                  ? "bg-accent/70 dark:bg-accent/40"
                  : ""
              }`}
              onClick={() => setSelectedNotebook(notebook)}
            >
              <span className="font-semibold text-sm line-clamp-2 text-left">
                {getNotebookTitle(notebook)}
              </span>
              <span className="text-xs text-muted-foreground">
                {transformTimeToLocalDate(notebook.updatedAt as Date)}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
