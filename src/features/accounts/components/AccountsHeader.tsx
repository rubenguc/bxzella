import { Button } from "@/components/ui/button";
import { useAccounts } from "../context/accounts-context";
import { Plus } from "lucide-react";

export function AccountsHeader() {
  const { setOpen } = useAccounts();

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
        <p className="text-muted-foreground">
          Manage your users and their roles here.
        </p>
      </div>
      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <span>Add Account</span> <Plus size={18} />
      </Button>
    </div>
  );
}
