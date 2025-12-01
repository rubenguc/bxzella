import type { CalendarCell } from "@/features/dashboard/interfaces/dashboard-interfaces";
import type { Coin } from "@/interfaces/global-interfaces";
import { formatDecimal } from "@/utils/number-utils";

interface CalendarCellProps extends CalendarCell {
  coin: Coin;
  onClick: () => void;
}

export function DayProfitsCell({
  date,
  amount,
  trades,
  coin,
  type,
  onClick,
}: CalendarCellProps) {
  const getCellClassName = () => {
    if (type === "profit") {
      return `cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900`;
    } else if (type === "loss") {
      return `cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900`;
    } else if (date !== null) {
      return `text-gray-800 dark:text-gray-300 bg-sidebar`;
    }

    return "";
  };

  return (
    <div
      onClick={amount !== null ? onClick : undefined}
      className={`min-h-24 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col  text-end  p-1 md:px-2 ${getCellClassName()}`}
    >
      {date !== null && (
        <>
          <div className="text-xs sm:text-sm  font-medium mb-0.5 sm:mb-1">
            {date}
          </div>

          {amount !== null && (
            <>
              <div
                className={`text-[8px] sm:text-[10px] lg:text-[1rem] font-bold leading-tight`}
              >
                {formatDecimal(amount)} {coin}
              </div>
              <div className="text-[10px] sm:text-xs  leading-tight">
                <span className="hidden sm:inline">{trades} trades</span>
                <span className="sm:hidden">{trades}T</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
