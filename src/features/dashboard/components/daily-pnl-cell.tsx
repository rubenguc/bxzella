import { m } from "#/paraglide/messages";
import type { CalendarCell } from "#/features/dashboard/types";
import { formatDecimal } from "#/lib/format-decimal";

interface DailyPnlCellProps extends CalendarCell {
  onClick: () => void;
}

export function DailyPnlCell({
  date,
  amount,
  trades,
  type,
  onClick,
}: DailyPnlCellProps) {
  const cellClassName = () => {
    if (type === "profit") {
      return "cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900";
    }
    if (type === "loss") {
      return "cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900";
    }
    if (date !== null) {
      return "text-gray-800 dark:text-gray-300 bg-sidebar";
    }
    return "";
  };

  return (
    <div
      onClick={amount !== null ? onClick : undefined}
      className={`min-h-20 md:min-h-30 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col text-end p-1 md:px-2 ${cellClassName()}`}
    >
      {date !== null ? (
        <>
          <div className="text-xs md:text-sm font-medium mb-0.5 sm:mb-1">
            {date}
          </div>

          {amount !== null ? (
            <>
              <div className="text-[9px] md:text-base lg:text-lg font-bold leading-tight">
                {formatDecimal(amount, { suffix: "USDT" })}
              </div>
              <div className="text-[10px] sm:text-xs leading-tight">
                <span className="hidden sm:inline">{trades} {m['daily-journal.trades']().toLowerCase()}</span>
                <span className="sm:hidden">{trades}T</span>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
