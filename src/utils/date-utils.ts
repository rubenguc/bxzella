import { endOfDay, format, parse, startOfDay } from "date-fns";
import { enUS, es } from "date-fns/locale";

export function transformTimeToLocalDate(time: Date | string | number) {
  if (!time) return "";

  const formattedDate = ["string", "number"].includes(typeof time)
    ? new Date(time).toLocaleDateString()
    : (time as Date).toLocaleDateString();
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

export const Timezone = new Date().getTimezoneOffset() / -60;

export const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

export const LOCALES = {
  es,
  en: enUS,
};
