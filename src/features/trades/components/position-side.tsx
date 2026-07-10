import { cn } from "#/lib/utils"
import { checkLongPosition } from "#/features/trades/helpers"

interface PositionSideProps {
  positionSide: string
  leverage: number | string
  className?: string
}

export function PositionSide({
  positionSide,
  leverage,
  className,
}: PositionSideProps) {
  const isLong = checkLongPosition(positionSide)

  return (
    <span
      className={cn(
        "font-medium capitalize",
        isLong ? "text-green-500" : "text-red-500",
        className,
      )}
    >
      {positionSide.toLowerCase()} {leverage}x
    </span>
  )
}
