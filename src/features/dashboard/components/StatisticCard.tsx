import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { JSX } from "react";

interface StatisticCardProps {
  title: JSX.Element | string;
  popoverInfo: string;
  extraInfo?: JSX.Element;
  contentClassName?: string;
  content: JSX.Element;
  rightContent?: JSX.Element;
}

export function StatisticCard({
  title,
  contentClassName,
  content,
  popoverInfo,
  extraInfo,
  rightContent,
}: StatisticCardProps) {
  const hasRightContent = rightContent !== undefined;

  return (
    <Card className="max-h-26">
      <CardContent>
        <div className="grid grid-cols-2 gap-5">
          <div
            className={`flex flex-col gap-1.5 ${!hasRightContent ? "col-span-2" : ""}`}
          >
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm">
              <p>{title}</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Info
                    className="text-gray-500 dark:text-gray-300"
                    size={16}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-balance">{popoverInfo}</p>
                </PopoverContent>
              </Popover>
              {extraInfo}
            </div>
            <div className={`w-full flex ${contentClassName}`}>{content}</div>
          </div>
          {hasRightContent && <div className="flex-2/5">{rightContent}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
