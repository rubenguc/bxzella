"use client";

import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRecentTrades } from "@/features/dashboard/context/recent-trades-context";
import { useUserConfigStore } from "@/store/user-config-store";

export function SyncBar() {
  const t = useTranslations("dashboard");
  const { refetch, isLoading } = useRecentTrades();
  const { selectedAccount, coin } = useUserConfigStore();

  const lastSync = selectedAccount?.lastSyncPerCoin[coin]
    ? new Date(selectedAccount?.lastSyncPerCoin[coin]).toLocaleString()
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 mb-3 text-sm md:text-base"
    >
      <span className="text-muted-foreground">
        {t("last_sync_time")}: {lastSync}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => refetch()}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      </Button>
    </motion.div>
  );
}
