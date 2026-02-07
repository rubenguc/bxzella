import { getUTCDay } from "@/utils/date-utils";
import { getTime, parseISO, subMilliseconds } from "date-fns";

export function getSyncTimeRange(startTime?: number): {
  startTs: number;
  endTs: number;
} {
  let startTs = 0;
  const actualDate = Date.now();

  if (startTime) {
    startTs = startTime;
  } else {
    const dateLess30Days = new Date(actualDate);
    dateLess30Days.setDate(dateLess30Days.getDate() - 30);
    startTs = dateLess30Days.getTime();
  }
  const endTs = actualDate;

  return { startTs, endTs };
}

export function adjustDateToUTC(
  date: string,
  timezoneMS: number,
  endOfDay: boolean = false,
) {
  return new Date(getUTCDay(date, endOfDay).getTime() - timezoneMS);
}

export function calculateIdealStartTime(
  openTimeISO: string,
  timeFrame: string,
  timezone = 0,
  candleCount = 500,
) {
  const openDate = parseISO(openTimeISO);

  const match = timeFrame.match(/^(\d+)([smhdw]$)/);
  if (!match) return getTime(openTimeISO);

  const value = parseInt(match[1]);
  const unit = match[2];

  // 2. Mapa de milisegundos por unidad
  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  const msPerCandle = value * (unitToMs[unit] || 0);

  const offsetMs = Math.floor(candleCount * 0.8) * msPerCandle;

  const idealStartDate = subMilliseconds(openDate, offsetMs);

  return getTime(idealStartDate) - timezone;
}
