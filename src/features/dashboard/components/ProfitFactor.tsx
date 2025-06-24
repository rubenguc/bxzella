import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { StatisticCard } from "./StatisticCard";

interface ProfitFactorProps {
  profitFactor: TradeStatisticsResult["profitFactor"];
}

export function ProfitFactor({ profitFactor }: ProfitFactorProps) {
  const t = useTranslations("dashboard.statistics");

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
        <div className="min-w-[170px]">
          <ResponsiveContainer
            width="100%"
            height={160}
            className="scale-35 -mt-13"
          >
            <PieChart>
              <Pie
                data={[
                  {
                    name: "wins",
                    value: profitFactor?.sumWin,
                  },
                  {
                    name: "losses",
                    value: profitFactor?.sumLoss,
                  },
                ]}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                <Cell strokeWidth={0} fill={"var(--color-green-500)"} />
                <Cell strokeWidth={0} fill={"var(--color-red-500)"} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}
