import type { JSX } from 'react'
import { Info } from 'lucide-react'
import {
  Card,
  CardContent,
} from '#/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

interface StatisticCardProps {
  title: string
  popoverInfo: string
  extraInfo?: JSX.Element
  content: JSX.Element
  rightContent?: JSX.Element
}

export function StatisticCard({
  title,
  popoverInfo,
  extraInfo,
  content,
  rightContent,
}: StatisticCardProps) {
  const hasRightContent = rightContent !== undefined

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2 gap-5">
          <div
            className={`flex flex-col gap-1.5 ${!hasRightContent ? 'col-span-2' : ''}`}
          >
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <p>{title}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-balance text-sm">{popoverInfo}</p>
                </TooltipContent>
              </Tooltip>
              {extraInfo}
            </div>
            <div className="w-full">{content}</div>
          </div>
          {hasRightContent && <div className="flex-2/5">{rightContent}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
