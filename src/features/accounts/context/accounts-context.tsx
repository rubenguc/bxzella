import { createContext, PropsWithChildren, useContext, useState } from "react";
import { AccountDocument } from "@/features/accounts/interfaces/accounts-interfaces";

type AccountsDialogType = "add" | "edit" | "delete";

interface AccountsContextType {
  open: AccountsDialogType | null;
  setOpen: (str: AccountsDialogType | null) => void;
  currentRow: AccountDocument | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountDocument | null>>;
}

const AccountsContext = createContext<AccountsContextType | null>(null);

export default function AccountsProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState<AccountsDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<AccountDocument | null>(null);

  return (
    <AccountsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export const useAccounts = () => {
  const accountsContext = useContext(AccountsContext);

  if (!accountsContext) {
    throw new Error("useUsers has to be used within <AccountsContext>");
  }

  return accountsContext;
};
