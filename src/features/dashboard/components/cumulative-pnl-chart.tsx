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
    const textColor = isDark ? "#9ca3af" : "#6b7280";
    const borderColor = isDark ? "#1f2937" : "#e5e7eb";
    const foregroundColor = isDark ? "#e5e7eb" : "#111827";

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
      topLineColor: "#22c55e",
      topFillColor1: "#22c55e40",
      topFillColor2: "#22c55e05",
      bottomLineColor: "#ef4444",
      bottomFillColor1: "#ef444440",
      bottomFillColor2: "#ef444405",
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
          color: isPositive ? "#22c55e" : "#ef4444",
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
