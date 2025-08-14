import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { StatisticCard } from "./StatisticCard";
import { useUserConfigStore } from "@/store/user-config-store";

interface ProfitFactorProps {
  profitFactor: TradeStatisticsResult["profitFactor"];
}

export function ProfitFactor({ profitFactor }: ProfitFactorProps) {
  const t = useTranslations("statistics");
  const { coin } = useUserConfigStore();

  return (
    <StatisticCard
      title={t("profit_factor") as string}
      popoverInfo={t("profit_factor_info")}
      content={
        <p className="text-xl inline-block">
          {formatDecimal(profitFactor?.value || 0)}
        </p>
      }
      rightContent={
        <div className="col-span-1">
          <ResponsiveContainer
            className="-mt-6"
            width="100%"
            height="100%"
            minHeight={100}
          >
            <PieChart>
              <Pie
                data={[
                  {
                    name: t("win"),
                    value: profitFactor?.sumWin,
                  },
                  {
                    name: t("lost"),
                    value: profitFactor?.sumLoss,
                  },
                ]}
                innerRadius="60%"
                outerRadius="80%"
                dataKey="value"
              >
                <Cell strokeWidth={0} fill={"var(--color-green-500)"} />
                <Cell strokeWidth={0} fill={"var(--color-red-500)"} />
                <Tooltip
                  formatter={(value) =>
                    `${formatDecimal(Number(value) || 0)} ${coin}`
                  }
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}
