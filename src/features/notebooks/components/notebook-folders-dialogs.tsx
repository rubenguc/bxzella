import { useNotebookFoldersContext } from "../context/notebook-folders-context";
import { NotebookFolderActionDialog } from "./notebook-folder-action-dialog";
import { NotebookFolderDeleteDialog } from "./notebook-folder-delete-dialog";

export function NotebookFoldersDialogs() {
  const {
    open,
    setOpen,
    selectedNotebookFolderAction,
    setSelectedNotebookFolderAction,
  } = useNotebookFoldersContext();

  return (
    <>
      <NotebookFolderActionDialog
        open={open === "add"}
        onOpenChange={() => setOpen(null)}
      />

      {selectedNotebookFolderAction && (
        <>
          <NotebookFolderActionDialog
            open={open === "edit"}
            onOpenChange={() => {
              setOpen(null);
              setTimeout(() => {
                setSelectedNotebookFolderAction(null);
              }, 500);
            }}
            selectedNotebookFolder={selectedNotebookFolderAction}
          />

          <NotebookFolderDeleteDialog
            open={open === "delete"}
            onOpenChange={() => {
              setOpen(null);
              setTimeout(() => {
                setSelectedNotebookFolderAction(null);
              }, 500);
            }}
            selectedNotebookFolder={selectedNotebookFolderAction}
          />
        </>
      )}
    </>
  );
}
