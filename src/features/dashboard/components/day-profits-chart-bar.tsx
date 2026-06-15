"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";

interface DayProfitsChartBarProps {
  data: TradeStatisticsResult["dayProfits"];
  coin: Coin;
}

export function DayProfitsChartBar({ data, coin }: DayProfitsChartBarProps) {
  const getBarColor = (value: number) => {
    if (value > 0) return "var(--color-green-500)";
    if (value < 0) return "var(--color-red-500)";
    return "var(--color-gray-500)";
  };

  const maxProfit = Math.max(...data.map((i) => i.profit));
  const minProfit = Math.min(...data.map((i) => i.profit));
  const yMin = minProfit >= 0 ? -maxProfit * 0.1 : minProfit * 1.15;
  const yMax = maxProfit * 1.15;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap="10%">
        <XAxis
          dataKey="day"
          tickFormatter={(value: string) => {
            const date = new Date(`${value}T12:00:00`);
            return date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
          }}
          interval={data.length <= 7 ? 0 : "equidistantPreserveStart"}
          tick={{ textAnchor: "middle", fontSize: 11 }}
          tickMargin={10}
          angle={data.length > 10 ? -45 : 0}
          height={data.length > 10 ? 60 : 30}
        />
        <YAxis
          width={45}
          domain={[yMin, yMax]}
          tickFormatter={(value: number) =>
            formatDecimal(value, { precision: 0, showNumberSuffix: false })
          }
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          cursor={{ opacity: 0.1 }}
          wrapperClassName="bg-card! text-white!"
          formatter={(profit: unknown) => [
            <span
              key="profit"
              className={`${getResultClass(Number(profit) || 0)}`}
            >
              {formatDecimal(profit as string, {
                precision: 2,
                showNumberSuffix: false,
                suffix: coin,
              })}
            </span>,
            null,
          ]}
          labelFormatter={(label) =>
            typeof label === "string"
              ? new Date(`${label}T12:00:00`).toLocaleDateString()
              : ""
          }
        />
        <Bar
          dataKey="profit"
          maxBarSize={data.length <= 5 ? 60 : 40}
          label={{
            position: "top",
            fontSize: 10,
            formatter: (value: unknown) =>
              formatDecimal(value as string, {
                precision: 2,
                showNumberSuffix: false,
              }),
          }}
        >
          {data.map(({ profit }, index) => (
            <Cell
              key={index.toString()}
              fill={getBarColor(profit)}
              className="transition-all duration-200 hover:opacity-100"
              enableBackground={0}
              fillOpacity={10}
              cursor="pointer"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
