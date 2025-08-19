"use client";

import { AccountsDialogs } from "@/features/accounts/components/accounts-dialogs";
import { AccountsHeader } from "@/features/accounts/components/accounts-header";
import { AccountsTable } from "@/features/accounts/components/accounts-table";
import AccountsProvider from "@/features/accounts/context/accounts-context";

export default function Accounts() {
  return (
    <AccountsProvider>
      <AccountsHeader />
      <AccountsTable />
      <AccountsDialogs />
    </AccountsProvider>
  );
}
