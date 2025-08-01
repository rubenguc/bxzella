import { formatDecimal } from "@/utils/number-utils";
import { CalendarCell } from "@/features/dashboard/interfaces/dashboard-interfaces";
import { Coin } from "@/global-interfaces";

interface CalendarCellProps extends CalendarCell {
  coin: Coin;
}

export function DayProfitsCell({
  date,
  amount,
  trades,
  coin,
  type,
}: CalendarCellProps) {
  const getCellClassName = () => {
    if (type === "profit") {
      return `cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900`;
    } else if (type === "loss") {
      return `cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900`;
    }

    return "";
  };

  return (
    <div
      className={`h-18  border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col  items-end justify-between text-center relative p-1 md:px-4 ${getCellClassName()}`}
    >
      {date !== null && (
        <>
          <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 flex">
            {date}
          </div>

          {amount !== null && (
            <div className="text-end">
              <div
                className={`text-[8px] sm:text-[10px] lg:text-[0.9rem] font-bold leading-tight`}
              >
                {formatDecimal(amount)} {coin}
              </div>
              <div className="text-[10px] sm:text-xs  leading-tight">
                <span className="hidden sm:inline">{trades} trades</span>
                <span className="sm:hidden">{trades}t</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
