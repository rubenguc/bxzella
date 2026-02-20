"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { AccountsDialogs } from "@/features/accounts/components/accounts-dialogs";
import { AccountsTable } from "@/features/accounts/components/accounts-table";
import AccountsProvider from "@/features/accounts/context/accounts-context";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/features/accounts/context/accounts-context";

function AccountsHeader() {
  const t = useTranslations("accounts");
  const { setOpen } = useAccounts();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 flex justify-end"
    >
      <Button
        className="gap-2"
        onClick={() => setOpen("add")}
        aria-label={t("add_account")}
      >
        <Plus className="h-4 w-4" />
        <span>{t("add_account")}</span>
      </Button>
    </motion.div>
  );
}

export default function Accounts() {
  return (
    <AccountsProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <AccountsHeader />
        <AccountsTable />
        <AccountsDialogs />
      </motion.div>
    </AccountsProvider>
  );
}
