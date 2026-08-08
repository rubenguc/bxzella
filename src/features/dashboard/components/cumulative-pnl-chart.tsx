import { useRef, useEffect } from "react";
import {
  createChart,
  BaselineSeries,
  LineType,
  createSeriesMarkers,
  type LineData,
} from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { m } from "#/paraglide/messages";
import { CHART_COLORS, withAlpha } from "#/lib/chart-colors";
import type { DayProfitEntry } from "#/features/dashboard/types";

const CHART_MIN_HEIGHT = 300;

interface CumulativePnlChartProps {
  dayProfits: DayProfitEntry[];
}

export function CumulativePnlChart({ dayProfits }: CumulativePnlChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const hasData = dayProfits.length > 0;

  useEffect(() => {
    if (!chartContainerRef.current || !hasData) return;

    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? CHART_COLORS.text.dark : CHART_COLORS.text.light;
    const borderColor = isDark
      ? CHART_COLORS.border.dark
      : CHART_COLORS.border.light;
    const foregroundColor = isDark
      ? CHART_COLORS.foreground.dark
      : CHART_COLORS.foreground.light;

    const chart = createChart(chartContainerRef.current, {
      handleScroll: false,
      handleScale: false,
      layout: {
        background: { color: "transparent" },
        textColor,
      },
      grid: {
        vertLines: { color: borderColor },
        horzLines: { color: borderColor },
      },
      crosshair: {
        vertLine: { color: foregroundColor, width: 1 },
        horzLine: { color: "transparent" },
      },
      timeScale: {
        timeVisible: true,
        borderColor,
      },
      rightPriceScale: {
        borderColor,
      },
      autoSize: true,
    });

    // Build cumulative line data
    let cumulative = 0;
    const lineData: LineData[] = dayProfits.map((entry) => {
      cumulative += Number(entry.netPnL);
      const time = Math.floor(
        new Date(entry.date + "T00:00:00Z").getTime() / 1000,
      );
      return { time, value: cumulative };
    });

    const lastValue = lineData[lineData.length - 1]?.value ?? 0;
    const isPositive = lastValue >= 0;

    const series = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: 0 },
      topLineColor: CHART_COLORS.green,
      topFillColor1: withAlpha(CHART_COLORS.green, 0.25),
      topFillColor2: withAlpha(CHART_COLORS.green, 0.02),
      bottomLineColor: CHART_COLORS.red,
      bottomFillColor1: withAlpha(CHART_COLORS.red, 0.25),
      bottomFillColor2: withAlpha(CHART_COLORS.red, 0.02),
      baseLineColor: borderColor,
      baseLineWidth: 1,
      lineWidth: 2,
      lineType: LineType.Curved,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      lastValueVisible: true,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => price.toFixed(2),
      },
    });

    series.setData(lineData);

    // Marker at the last point
    const lastPoint = lineData[lineData.length - 1];
    if (lastPoint) {
      createSeriesMarkers(series, [
        {
          time: lastPoint.time,
          position: "inBar",
          shape: "circle",
          color: isPositive ? CHART_COLORS.green : CHART_COLORS.red,
          size: 2,
        },
      ]);
    }

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [dayProfits, hasData]);

  const cardTitle = <CardTitle>{m['statistics.profits_by_day']()}</CardTitle>;

  if (!hasData) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>{cardTitle}</CardHeader>
        <CardContent
          className="flex items-center justify-center min-h-[300px] flex-1"
        >
          <p className="text-muted-foreground">{m['statistics.no_data_to_show']()}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>{cardTitle}</CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div ref={chartContainerRef} className="min-h-[300px] h-full" />
      </CardContent>
    </Card>
  );
}
