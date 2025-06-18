import { format, parse, startOfDay, endOfDay } from "date-fns";

export function transformTimeToLocalDate(time: number | string) {
  const date = new Date(time);
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
}

export function transformDateToParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function getMongoDBUTCRange(
  startDateLocal: string,
  endDateLocal: string,
): { startDateUTC: Date; endDateUTC: Date } {
  const startDate = parse(startDateLocal, "yyyy-MM-dd", new Date());
  const endDate = parse(endDateLocal, "yyyy-MM-dd", new Date());

  const startOfDayLocal = startOfDay(startDate);
  const endOfDayLocal = endOfDay(endDate);

  const startDateUTC = new Date(startOfDayLocal.toISOString());
  const endDateUTC = new Date(endOfDayLocal.toISOString());

  return {
    startDateUTC,
    endDateUTC,
  };
}

export function getUTCDay(dateStr: string, endOfDayFlag = false): Date {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  return new Date(
    (endOfDayFlag ? endOfDay(date) : startOfDay(date)).toISOString(),
  );
}
