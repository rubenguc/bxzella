import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TradeStatisticsResult } from "@/features/trades/interfaces/trades-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { getResultClass } from "@/utils/trade-utils";

export function DayProfitsChart({
  data,
}: {
  data: TradeStatisticsResult["dayProfits"];
}) {
  const t = useTranslations("statistics");
  const { coin, dayProfitsChartMode, setDayProfitsChartMode } =
    useUserConfigStore();

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.profit));
    const dataMin = Math.min(...data.map((i) => i.profit));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };

  const getBarColor = (value: number) => {
    if (value > 0) {
      return "var(--color-green-500)";
    } else if (value < 0) {
      return "var(--color-red-500)";
    }
    return "var(--color-gray-500)";
  };

  const off = gradientOffset();

  const commonChartProps = {
    data,
  };

  const CustomLabel = (props: any) => {
    const { x, y, value } = props;
    const numericValue = Number(value);
    const formattedValue = formatDecimal(numericValue, 2);
    const textColor = getBarColor(numericValue);

    const dy = numericValue >= 0 ? -10 : 10;

    return (
      <text
        x={x}
        y={y}
        dy={dy}
        textAnchor="middle"
        fill={textColor}
        fontSize={10}
      >
        {formattedValue}
      </text>
    );
  };

  const commonAxisProps = (
    <>
      <XAxis
        dataKey="day"
        tickFormatter={(value) => new Date(value).toLocaleDateString()}
        interval="equidistantPreserveStart"
        tick={{ textAnchor: "middle" }}
        tickMargin={10}
      />
      <YAxis width="auto" domain={["auto", (dataMax) => dataMax * 1.15]} />
      <Tooltip
        wrapperClassName="bg-card! text-white!"
        formatter={(profit, index) => [
          <span
            key={index}
            className={`${getResultClass(Number(profit) || 0)}`}
          >
            {formatDecimal(Number(profit), 2)} {coin}
          </span>,
          null,
        ]}
        labelFormatter={(label) => new Date(label).toLocaleDateString()}
      />
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profits_by_day")}</CardTitle>
        <CardAction>
          <Select
            value={dayProfitsChartMode}
            onValueChange={setDayProfitsChartMode}
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Seleccionar Gráfico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">{t("area_chart")}</SelectItem>
              <SelectItem value="bar">{t("bar_chart")}</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="h-[420px] outline-0!">
        {data.length === 0 ? (
          <div>
            <span>{t("no_data_to_show")}</span>
          </div>
        ) : (
          <ResponsiveContainer>
            {dayProfitsChartMode === "area" ? (
              <AreaChart {...commonChartProps} className="ring-0">
                {commonAxisProps}
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0"
                      stopColor="var(--color-green-500)"
                      stopOpacity={1}
                    />
                    <stop
                      offset={off}
                      stopColor="var(--color-green-500)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset={off}
                      stopColor="var(--color-red-500)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="1"
                      stopColor="var(--color-red-500)"
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#fff"
                  fill="url(#splitColor)"
                >
                  <LabelList content={CustomLabel} />
                </Area>
              </AreaChart>
            ) : (
              <BarChart {...commonChartProps}>
                {commonAxisProps}
                <Bar
                  dataKey="profit"
                  label={{
                    position: "top",
                    fontSize: 10,
                    formatter: (value) => formatDecimal(Number(value), 2),
                  }}
                >
                  {data.map(({ profit }, index) => (
                    <Cell key={index.toString()} fill={getBarColor(profit)} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
