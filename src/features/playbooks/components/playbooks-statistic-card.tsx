import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { JSX } from "react";

interface PlaybooksStatisticValueProps {
  title: string;
  popoverInfo?: string;
  value: string | number | JSX.Element;
}

export const PlaybooksStatisticValue = ({
  title,
  popoverInfo,
  value,
}: PlaybooksStatisticValueProps) => {
  const isString = typeof value === "string" || typeof value === "number";

  return (
    <div className="flex flex-col text-gray-500 dark:text-gray-300 ">
      <p className="text-sm">{title}</p>
      {popoverInfo && (
        <Popover>
          <PopoverTrigger asChild>
            <Info className="text-gray-500 dark:text-gray-300" size={16} />
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <p className="text-balance text-sm">{popoverInfo}</p>
          </PopoverContent>
        </Popover>
      )}
      {isString ? <span className="text-lg">{value}</span> : value}
    </div>
  );
};
