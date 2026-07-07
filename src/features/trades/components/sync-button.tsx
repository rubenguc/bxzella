import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { useUserConfig } from "#/store/user-config";
import { syncTrades } from "#/features/trades/service";
import type { Coin } from "#/features/exchange-providers/types";

interface Props {
  accountId: string;
  coin: Coin;
}

export function SyncButton({ accountId, coin }: Props) {
  const { selectedAccount, updateLastSyncTime } = useUserConfig();
  const queryClient = useQueryClient();

  const lastSyncTime = selectedAccount?.lastSyncPerCoin?.[coin] ?? 0;

  const syncQuery = useQuery({
    queryKey: ["sync", accountId, coin],
    queryFn: async () => {
      const result = await syncTrades(accountId, coin);
      if (result.synced) {
        updateLastSyncTime(result.syncTime);
        queryClient.invalidateQueries({
          queryKey: ["trades", accountId, coin],
        });
      }
      return result;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        {m["dashboard.last_sync_time"]()}:{" "}
        {lastSyncTime > 0 ? new Date(lastSyncTime).toLocaleString() : "-"}
      </span>
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => syncQuery.refetch()}
        disabled={syncQuery.isFetching}
        aria-label="Sync trades"
      >
        <RefreshCw className={syncQuery.isFetching ? "animate-spin" : ""} />
      </Button>
    </div>
  );
}
