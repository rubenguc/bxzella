import { getUTCDay } from "@/utils/date-utils";

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
