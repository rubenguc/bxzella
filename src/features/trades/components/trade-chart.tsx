import { useQuery } from "@tanstack/react-query";
import { getTime, parseISO } from "date-fns";
import {
  type CandlestickData,
  CandlestickSeries,
  type CandlestickSeriesOptions,
  type CandlestickStyleOptions,
  ColorType,
  CrosshairMode,
  createChart,
  createSeriesMarkers,
  type DeepPartial,
  type ISeriesApi,
  type SeriesMarker,
  type SeriesOptionsCommon,
  type Time,
  type WhitespaceData,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { getKLineData } from "@/features/providers/services/providers-service";
import type { Coin } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import { Timezone } from "@/utils/date-utils";

interface TradeChartProps {
  symbol: string;
  openTime: string;
  updateTime: string;
  avgPrice: string;
  avgClosePrice: string;
  coin: Coin;
}

type ChartSeries = ISeriesApi<
  "Candlestick",
  Time,
  CandlestickData<Time> | WhitespaceData<Time>,
  CandlestickSeriesOptions,
  DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon>
>;

const findBarTime = (isoString: string, seriesData: any[]) => {
  const targetMs = getTime(parseISO(isoString)) - Timezone;
  const targetSeconds = targetMs / 1000;
  const closestBar = [...seriesData]
    .reverse()
    .find((bar) => bar.time <= targetSeconds);

  return closestBar ? closestBar.time : targetSeconds;
};

const TIME_FRAMES = ["1h", "4h", "1d"] as const;

export function TradeChart({
  symbol,
  openTime,
  coin,
  updateTime,
  avgPrice,
  avgClosePrice,
}: TradeChartProps) {
  const { selectedAccount, tradeChartTimeframe, setTradeChartTimeframe } =
    useUserConfigStore();

  const { data, isLoading } = useQuery({
    queryKey: ["trade-chart", symbol, openTime, tradeChartTimeframe],
    queryFn: () =>
      getKLineData({
        coin,
        symbol,
        startTime: openTime,
        accountId: selectedAccount!._id,
        interval: tradeChartTimeframe,
      }),
    enabled: !!selectedAccount?._id || !!tradeChartTimeframe,
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ChartSeries | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef?.current, {
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      grid: {
        horzLines: {
          color: "#121212",
        },
        vertLines: {
          color: "#121212",
        },
      },
      layout: {
        textColor: "#646464",
        background: { type: ColorType.VerticalGradient },
      },
      width: chartContainerRef?.current.clientWidth,
      height: 400,
    });

    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      timeVisible: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    series.setData([]);
    chartRef.current = chart;
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect(() => {
    const chart = chartRef.current;
    if (!data || data.length === 0 || !chart) return;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    seriesRef.current = series;

    const chartSeriesData = data
      .map((d) => ({
        time: (d.time - Timezone) / 1000,
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
      }))
      .sort((a, b) => a.time - b.time) as {
      time: Time;
      open: number;
      high: number;
      low: number;
      close: number;
    }[];

    series.setData(chartSeriesData);

    const markers: SeriesMarker<Time>[] = [];

    const markerOpenTime = findBarTime(openTime, chartSeriesData);
    const markerUpdateTime = findBarTime(updateTime, chartSeriesData);

    // open
    markers.push({
      time: markerOpenTime,
      position: "belowBar",
      color: "#2196F3",
      shape: "arrowUp",
      text: `Buy @ ${avgPrice}`,
      price: Number(avgPrice),
    });

    // close
    markers.push({
      time: markerUpdateTime,
      position: "aboveBar",
      color: "#e91e63",
      shape: "arrowDown",
      text: `Sell @ ${avgClosePrice}`,
      price: Number(avgClosePrice),
    });

    // series.setMarkers(markers);
    createSeriesMarkers(series, markers);

    const margin = 20 * 3600;

    requestAnimationFrame(() => {
      chart.timeScale().setVisibleRange({
        from: (markerOpenTime as number) - margin,
        to: (markerOpenTime as number) + margin,
      });
    });
  }, [data]);

  return (
    <>
      <Select
        value={tradeChartTimeframe}
        onValueChange={setTradeChartTimeframe}
      >
        <SelectTrigger className="w-fit max-w-48 ml-auto">
          <SelectValue placeholder="TimeFrame" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {TIME_FRAMES.map((timeFrame) => (
              <SelectItem key={timeFrame} value={timeFrame}>
                {timeFrame}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="relative" ref={chartContainerRef}>
        {!data && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black/40">
            {isLoading ? (
              <Spinner className="size-7" />
            ) : (
              <p>no data available</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
