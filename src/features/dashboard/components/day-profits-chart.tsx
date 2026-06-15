import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { DayProfitsChartBar } from "./day-profits-chart-bar";

export function DayProfitsChart({
  data,
}: {
  data: TradeStatisticsResult["dayProfits"];
}) {
  const t = useTranslations("statistics");
  const coin = useUserConfigStore((state) => state.coin);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profits_by_day")}</CardTitle>
      </CardHeader>
      <CardContent className="h-[420px] outline-0! px-2">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground">
              {t("no_data_to_show")}
            </span>
          </div>
        ) : (
          <DayProfitsChartBar data={data} coin={coin} />
        )}
      </CardContent>
    </Card>
  );
}
