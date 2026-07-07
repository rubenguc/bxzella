import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns"
import { CalendarIcon } from "lucide-react"
import { es } from "react-day-picker/locale"
import type { DateRange } from "react-day-picker"
import { useCallback, useEffect, useState } from "react"

import { m } from "#/paraglide/messages"
import { Button } from "#/components/ui/button"
import { Calendar } from "#/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover"
import { useUserConfig } from "#/store/user-config"

const LOCALES: Record<string, typeof es | undefined> = {
  es,
}

export function DateRangeSelector() {
  const { startDate, endDate, updateDateRange, selectedAccount, coin } =
    useUserConfig()

  const earliestTradeDate = selectedAccount?.earliestTradeDatePerCoin?.[coin]
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [open, setOpen] = useState(false)

  // Set initial date range from store or default to last 7 days
  useEffect(() => {
    if (!startDate && !endDate) {
      const now = new Date()
      const sevenDaysAgo = subDays(now, 7)
      setDateRange({ from: sevenDaysAgo, to: now })
      updateDateRange(sevenDaysAgo, now)
    } else if (startDate && endDate && !dateRange?.from) {
      setDateRange({ from: startDate, to: endDate })
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = useCallback(
    (open: boolean) => {
      setOpen(open)
      if (!open && dateRange?.from && dateRange?.to) {
        updateDateRange(dateRange.from, dateRange.to)
      }
    },
    [dateRange, updateDateRange],
  )

  // Predefined date ranges
  const predefinedRanges = [
    {
      label: m["date_range_selector.today"](),
      range: () => {
        const today = new Date()
        return { from: today, to: today }
      },
    },
    {
      label: m["date_range_selector.this_week"](),
      range: () => {
        const today = new Date()
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
        return {
          from: startOfWeek(today, { weekStartsOn: 0 }),
          to: weekEnd > today ? today : weekEnd,
        }
      },
    },
    {
      label: m["date_range_selector.this_month"](),
      range: () => {
        const today = new Date()
        const monthEnd = endOfMonth(today)
        return {
          from: startOfMonth(today),
          to: monthEnd > today ? today : monthEnd,
        }
      },
    },
    {
      label: m["date_range_selector.last_30_days"](),
      range: () => {
        const today = new Date()
        return {
          from: subDays(today, 30),
          to: today,
        }
      },
    },
    {
      label: m["date_range_selector.last_month"](),
      range: () => {
        const today = new Date()
        const firstDayLastMonth = startOfMonth(subMonths(today, 1))
        const lastDayLastMonth = endOfMonth(subMonths(today, 1))
        return {
          from: firstDayLastMonth,
          to: lastDayLastMonth > today ? today : lastDayLastMonth,
        }
      },
    },
  ]

  const selectPredefinedRange = (
    rangeFn: () => { from: Date; to: Date },
  ) => {
    const range = rangeFn()
    setDateRange(range)
  }

  const locale = LOCALES[navigator.language.split("-")[0]]
  const startMonth = earliestTradeDate
    ? new Date(earliestTradeDate)
    : subDays(new Date(), 30)

  return (
    <Popover open={open} onOpenChange={handleClose}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="justify-start gap-1 rounded-xl font-normal"
          />
        }
      >
        <CalendarIcon className="size-4 opacity-50" />
        <span className="hidden md:block text-sm">
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            m["date_range_selector.today"]()
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto p-0" align="end">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          startMonth={startMonth}
          endMonth={new Date()}
          disabled={[{ before: startMonth }, { after: new Date() }]}
          locale={locale}
        />
        <div className="w-fit border-l p-1 bg-background">
          {predefinedRanges.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal"
              onClick={() => selectPredefinedRange(item.range)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
