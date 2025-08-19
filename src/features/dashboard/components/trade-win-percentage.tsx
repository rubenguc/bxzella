import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { StatisticCard } from "./statistic-card";
import { Badge } from "@/components/ui/badge";

interface TradeWinPercentageProps {
  tradeWin: TradeStatisticsResult["tradeWin"];
}

export function TradeWinPercentage({ tradeWin }: TradeWinPercentageProps) {
  const t = useTranslations("statistics");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { cx, outerRadius, value, index } = props;

    const RADIAN = Math.PI / 180;
    const angleRad = index === 0 ? 180 * RADIAN : 0 * RADIAN;

    const x = cx + outerRadius * 0.9 * Math.cos(angleRad) - 12;

    return (
      <foreignObject
        x={x}
        y={50}
        width={24}
        height={24}
        style={{ textAlign: "center" }}
      >
        <div style={{ display: "inline-block", pointerEvents: "auto" }}>
          <Badge
            className={`px-1.5 py-[1px] w-[22px] rounded-full ${
              index === 0
                ? "text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900"
                : "text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900"
            }`}
          >
            {value}
          </Badge>
        </div>
      </foreignObject>
    );
  };

  return (
    <StatisticCard
      title={t("trade_win_percentage") as string}
      popoverInfo={t("trade_win_percentage_info")}
      contentClassName="flex justify-between items-end"
      content={
        <p className="text-xl">{formatDecimal(tradeWin?.value || 0)}%</p>
      }
      rightContent={
        <div className="col-span-1">
          <ResponsiveContainer
            className="-mt-3"
            width="100%"
            height="100%"
            minHeight={100}
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
                innerRadius="60%"
                outerRadius="80%"
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
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
