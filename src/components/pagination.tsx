import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/components/ui/button'

interface Props {
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onNext: () => void
  onPrev: () => void
  onFirst: () => void
  onLast: () => void
  onGoTo: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  onFirst,
  onLast,
  onGoTo,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {m['common_messages.page']()} {page + 1} {m['common_messages.of']()} {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          disabled={!hasPrev}
          onClick={onFirst}
          aria-label={m['common_messages.go_to_first_page']()}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          disabled={!hasPrev}
          onClick={onPrev}
          aria-label={m['common_messages.go_to_previous_page']()}
        >
          <ChevronLeft />
        </Button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(0, Math.min(page - 2, totalPages - 5))
          const p = start + i
          return (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="xs"
              onClick={() => onGoTo(p)}
            >
              {p + 1}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="icon-xs"
          disabled={!hasNext}
          onClick={onNext}
          aria-label={m['common_messages.go_to_next_page']()}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          disabled={!hasNext}
          onClick={onLast}
          aria-label={m['common_messages.go_to_last_page']()}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}
