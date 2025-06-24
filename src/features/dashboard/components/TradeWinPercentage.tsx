import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { StatisticCard } from "./StatisticCard";

interface TradeWinPercentageProps {
  tradeWin: TradeStatisticsResult["tradeWin"];
}

export function TradeWinPercentage({ tradeWin }: TradeWinPercentageProps) {
  const t = useTranslations("dashboard.statistics");

  return (
    <StatisticCard
      title={t("trade_win_percentage") as string}
      popoverInfo={t("trade_win_percentage_info")}
      contentClassName="flex justify-between items-end"
      content={
        <p className="text-xl">{formatDecimal(tradeWin?.value || 0)}%</p>
      }
      rightContent={
        <div className="col-span-1 min-w-[170px]">
          <ResponsiveContainer
            width="100%"
            height={160}
            className="scale-35 -mt-10"
          >
            <PieChart>
              <Pie
                data={[
                  {
                    name: "wins",
                    value: tradeWin?.totalWin || 0,
                  },
                  {
                    name: "losses",
                    value: tradeWin?.totalLoss || 0,
                  },
                ]}
                startAngle={180}
                endAngle={0}
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
