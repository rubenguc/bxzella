"use client";

import { AccountsDialogs } from "@/features/accounts/components/AccountsDialogs";
import { AccountsHeader } from "@/features/accounts/components/AccountsHeader";
import { AccountsTable } from "@/features/accounts/components/AccountsTable";
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
