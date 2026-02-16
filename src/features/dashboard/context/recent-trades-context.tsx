import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { createContext, type PropsWithChildren, useContext } from "react";
import { toast } from "sonner";
import type { TradeDocument } from "@/features/trades/interfaces/trades-interfaces";
import { getTrades } from "@/features/trades/services/trades-services";
import type { PaginationResponseWithSync } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { transformDateToParam } from "@/utils/date-utils";

interface RecentTradesContextValue {
  recentTrades: TradeDocument[];
  isLoading: boolean;
}

const RecentTradesContext = createContext<RecentTradesContextValue>({
  recentTrades: [],
  isLoading: false,
});

export default function RecentTradesProvider({ children }: PropsWithChildren) {
  const t = useTranslations("dashboard.recent_trades");

  const {
    selectedAccount,
    coin,
    startDate,
    endDate,
    isStoreLoaded,
    updateLastSyncTime,
    updateEarliestTradeDate,
  } = useUserConfigStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<
    PaginationResponseWithSync<TradeDocument>
  >({
    queryKey: ["all-trades", selectedAccount?._id, startDate, endDate, coin],
    enabled:
      isStoreLoaded && !!selectedAccount?._id && !!startDate && !!endDate,
    queryFn: async () => {
      toast.loading(t("syncing_new_trades"), {
        position: "top-center",
      });
      const response = await getTrades({
        accountId: selectedAccount!._id,
        startDate: transformDateToParam(startDate as Date),
        endDate: transformDateToParam(endDate as Date),
        limit: 10,
        page: 0,
        coin,
      });
      toast.dismiss();

      if (response.synced) {
        toast.success(t("new_trades_synced"), {
          position: "top-center",
        });
        queryClient.invalidateQueries({ queryKey: ["statistics"] });
        queryClient.invalidateQueries({ queryKey: ["day-profits"] });
        updateLastSyncTime(response.syncTime);
        if (response.earliestTradeDate) {
          updateEarliestTradeDate(response.earliestTradeDate);
        }
      }

      return response;
    },
  });

  return (
    <RecentTradesContext.Provider
      value={{
        recentTrades: data?.data || [],
        isLoading,
      }}
    >
      {children}
    </RecentTradesContext.Provider>
  );
}

export const useRecentTrades = () => {
  const context = useContext(RecentTradesContext);

  if (!context) {
    throw new Error(
      "useRecentTrades must be used within a RecentTradesProvider",
    );
  }

  return context;
};
