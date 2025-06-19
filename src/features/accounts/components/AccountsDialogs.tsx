import { useAccounts } from "@/features/accounts/context/accounts-context";
import { AccountsActionDialog } from "./AccountsActionDialog";
import { AccountsDeleteDialog } from "./AccountsDeleteDialog";

export function AccountsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAccounts();

  return (
    <>
      <AccountsActionDialog
        open={open === "add"}
        onOpenChange={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <AccountsActionDialog
            open={open === "edit"}
            onOpenChange={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <AccountsDeleteDialog
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
