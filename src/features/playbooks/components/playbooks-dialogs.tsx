import { usePlaybooks } from "../context/playbooks-context";
import { PlaybooksActionDialog } from "./playbooks-action-dialog";
import { PlaybooksDeleteDialog } from "./playbooks-delete-dialog";

export function PlaybooksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePlaybooks();

  return (
    <>
      <PlaybooksActionDialog
        open={open === "add"}
        onOpenChange={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <PlaybooksActionDialog
            open={open === "edit"}
            onOpenChange={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <PlaybooksDeleteDialog
            open={open === "delete"}
            onOpenChange={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
