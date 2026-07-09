import { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createChart,
  CandlestickSeries,
  createSeriesMarkers,
  CrosshairMode,
  LineStyle,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  type SeriesMarker,
  type IPriceLine,
} from "lightweight-charts";
import { apiClient, Timezone } from "#/lib/api-client";
import { m } from "#/paraglide/messages";
import { formatDecimal } from "#/lib/format-decimal";
import type { Coin, KLine } from "#/features/exchange-providers/types";
import { getTime, parseISO } from "date-fns";

const TIME_FRAMES = ["1h", "4h", "1d"] as const;

interface TradeChartProps {
  symbol: string;
  openTime: string;
  updateTime: string;
  avgPrice: string;
  avgClosePrice: string;
  positionSide: string;
  coin: Coin;
  netProfit: string;
  accountId: string;
}

type ChartSeries = ISeriesApi<"Candlestick", Time, CandlestickData<Time>>;

const findBarTime = (isoString: string, seriesData: any[]) => {
  const targetMs = getTime(parseISO(isoString)) - Timezone;
  const targetSeconds = targetMs / 1000;
  const closestBar = [...seriesData]
    .reverse()
    .find((bar) => bar.time <= targetSeconds);

  return closestBar ? closestBar.time : targetSeconds;
};

export function TradeChart({
  symbol,
  openTime,
  updateTime,
  avgPrice,
  avgClosePrice,
  positionSide,
  coin,
  netProfit,
  accountId,
}: TradeChartProps) {
  const [timeframe, setTimeframe] = useState<string>("1h");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ChartSeries | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  const openMs = new Date(openTime).getTime();

  const { data, isLoading } = useQuery({
    queryKey: ["kline", symbol, openTime, timeframe],
    queryFn: async () => {
      const { data } = await apiClient.get<KLine[]>("/kline", {
        params: {
          accountId,
          coin,
          symbol,
          startTime: openMs,
          interval: timeframe,
        },
      });
      return data;
    },
    enabled: !!accountId,
  });

  // Create chart once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = document.documentElement.classList.contains("dark");

    const chart = createChart(chartContainerRef.current, {
      crosshair: { mode: CrosshairMode.Normal },
      layout: {
        background: { color: "transparent" },
        textColor: isDark ? "#9ca3af" : "#6b7280",
      },
      grid: {
        vertLines: { color: isDark ? "#1f2937" : "#e5e7eb" },
        horzLines: { color: isDark ? "#1f2937" : "#e5e7eb" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      autoSize: true,
      timeScale: { timeVisible: true },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    series.setData([]);
    chartRef.current = chart;
    seriesRef.current = series;

    return () => chart.remove();
  }, []);

  // Update data when it loads
  useEffect(() => {
    if (!data || data.length === 0 || !seriesRef.current || !chartRef.current)
      return;

    const chart = chartRef.current;
    const series = seriesRef.current;

    const chartData = data
      .map((d) => ({
        time: Math.floor(d.time / 1000) as Time,
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    series.setData(chartData);

    const isLong = positionSide === "LONG";
    const isWin = Number(netProfit) > 0;
    const isCloseAbove = Number(avgClosePrice) > Number(avgPrice);

    const markers: SeriesMarker<Time>[] = [
      {
        time: findBarTime(openTime, chartData),
        position: isLong ? "belowBar" : "aboveBar",
        color: "#2196F3",
        shape: isLong ? "arrowUp" : "arrowDown",
        text: `${m["trade_chart.entry_marker"]()} @ ${formatDecimal(avgPrice, { precision: 6 })}`,
      },
      {
        time: findBarTime(updateTime, chartData),
        position: isCloseAbove ? "aboveBar" : "belowBar",
        color: isWin ? "#22c55e" : "#ef4444",
        shape: isCloseAbove ? "arrowDown" : "arrowUp",
        text: `${m["trade_chart.close_marker"]()} @ ${formatDecimal(avgClosePrice, { precision: 6 })}`,
      },
    ];

    // Safely clear previous price lines — they may be orphaned if the chart was
    // re-created or the series invalidated them internally on setData.
    priceLinesRef.current.forEach((pl) => pl?.remove?.());
    priceLinesRef.current = [];

    createSeriesMarkers(series, markers);

    // Horizontal price lines
    const entryPrice = Number(avgPrice);
    if (entryPrice > 0) {
      const pl = series.createPriceLine({
        price: entryPrice,
        color: "#9ca3af",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: m["trade_chart.entry_marker"](),
      });
      priceLinesRef.current.push(pl);
    }

    const closePrice = Number(avgClosePrice);
    if (closePrice > 0) {
      const pl = series.createPriceLine({
        price: closePrice,
        color: isWin ? "#22c55e" : "#ef4444",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: m["trade_chart.close_marker"](),
      });
      priceLinesRef.current.push(pl);
    }

    // Zoom to show the trade period
    const candleDiff =
      chartData.length > 1
        ? (chartData[1].time as number) - (chartData[0].time as number)
        : 3600;
    const margin = candleDiff * 50;

    requestAnimationFrame(() => {
      chart.timeScale().setVisibleRange({
        from: (markers[0].time as number) - margin,
        to: (markers[0].time as number) + margin,
      });
    });
  }, [data]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="w-fit max-w-48 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          {TIME_FRAMES.map((tf) => (
            <option key={tf} value={tf}>
              {tf}
            </option>
          ))}
        </select>
      </div>
      <div className="relative" ref={chartContainerRef}>
        {isLoading && !data && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50 rounded-lg">
            <p className="text-muted-foreground">{m["trade_chart.loading"]()}</p>
          </div>
        )}
        {!isLoading && data && data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-50 rounded-lg">
            <p className="text-muted-foreground">{m["trade_chart.no_data"]()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
