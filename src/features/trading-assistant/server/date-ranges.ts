import {
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  format,
} from "date-fns";

export function getDateRange(rangeType: string): { startDate: string; endDate: string } {
  const now = new Date();

  switch (rangeType) {
    case "today": {
      const today = startOfDay(now);
      return {
        startDate: format(today, "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    }
    case "this-week": {
      const start = startOfWeek(now, { weekStartsOn: 0 }); // Sunday as week start
      const end = endOfWeek(now, { weekStartsOn: 0 });
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    }
    case "last-week": {
      const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 0 });
      const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 0 });
      return {
        startDate: format(lastWeekStart, "yyyy-MM-dd"),
        endDate: format(lastWeekEnd, "yyyy-MM-dd"),
      };
    }
    case "this-month": {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    }
    case "last-month": {
      const lastMonth = subDays(startOfMonth(now), 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    }
    case "last-30-days": {
      const end = now;
      const start = subDays(end, 29);
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    }
    default: {
      // Default to current month
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    }
  }
}
