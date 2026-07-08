import type { JSX } from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";

interface StatisticCardProps {
  title: string;
  popoverInfo: string;
  extraInfo?: JSX.Element;
  content: JSX.Element;
  rightContent?: JSX.Element;
}

export function StatisticCard({
  title,
  popoverInfo,
  extraInfo,
  content,
  rightContent,
}: StatisticCardProps) {
  const hasRightContent = rightContent !== undefined;

  return (
    <Card className="max-h-[108px]">
      <CardContent>
        <div className="flex items-start gap-3 h-full">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <p className="truncate">{title}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-balance text-sm">{popoverInfo}</p>
                </TooltipContent>
              </Tooltip>
              {extraInfo}
            </div>
            <div className="w-full">{content}</div>
          </div>
          {hasRightContent && (
            <div className="w-[90px] h-[76px] shrink-0">{rightContent}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
