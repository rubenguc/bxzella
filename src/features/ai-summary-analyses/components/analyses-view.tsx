'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { m } from '#/paraglide/messages'
import { fetchAnalysesBySubscription } from '#/features/ai-summary-analyses/service'
import { formatDate } from '#/lib/date-utils'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

interface AnalysesViewProps {
  subscriptionId: string
}

const PAGE_SIZE = 10

function JsonDisplay({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null) {
    return <span className="text-muted-foreground italic">null</span>
  }

  if (typeof data === 'boolean') {
    return (
      <span className={data ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
        {String(data)}
      </span>
    )
  }

  if (typeof data === 'number') {
    return <span className="text-blue-600 dark:text-blue-400">{String(data)}</span>
  }

  if (typeof data === 'string') {
    return <span>{data}</span>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-muted-foreground italic">(empty)</span>
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {data.map((item, i) => (
          <li key={i}>
            <JsonDisplay data={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    )
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>)
    if (entries.length === 0) {
      return <span className="text-muted-foreground italic">(empty)</span>
    }

    // Top-level keys render as titled sections; nested renders inline
    if (depth === 0) {
      return (
        <div className="space-y-4">
          {entries.map(([key, value]) => (
            <div key={key}>
              <h4 className="font-semibold text-sm text-foreground capitalize">{key.replace(/_/g, ' ')}</h4>
              <div className="mt-1 pl-2 text-sm text-muted-foreground">
                <JsonDisplay data={value} depth={depth + 1} />
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Nested object — each entry on its own line
    return (
      <div className="space-y-1">
        {entries.map(([key, value]) => (
          <div key={key}>
            <span className="text-foreground font-medium">{key}: </span>
            <JsonDisplay data={value} depth={depth + 1} />
          </div>
        ))}
      </div>
    )
  }

  return <span>{String(data)}</span>
}

export function AnalysesView({ subscriptionId }: AnalysesViewProps) {
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['ai-summary-analyses', subscriptionId, offset],
    queryFn: () =>
      fetchAnalysesBySubscription(subscriptionId, {
        limit: PAGE_SIZE,
        offset,
      }),
  })

  const analyses = data?.rows ?? []
  const total = data?.total ?? 0
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasPrevious = offset > 0
  const hasNext = offset + PAGE_SIZE < total

  // Auto-select first item when list changes
  const selected = analyses.find((a) => a.id === selectedId) ?? analyses[0] ?? null

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:h-[70vh]">
        <div className="w-full md:w-80 space-y-2 shrink-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1 hidden md:block">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        {m['ai_summary.analyses_empty']()}
      </p>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:h-[70vh]">
      {/* List — hidden on mobile when an item is selected */}
      <div className={`w-full md:w-80 shrink-0 flex flex-col gap-2 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex-1 overflow-y-auto -mx-1 px-1 max-h-[40vh] md:max-h-none">
          <div className="space-y-1">
            {analyses.map((analysis) => (
              <button
                key={analysis.id}
                type="button"
                onClick={() => setSelectedId(analysis.id)}
                className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                  selected?.id === analysis.id
                    ? 'border-primary bg-accent'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="text-sm font-medium">
                  {formatDate(analysis.weekStart)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  v{analysis.version}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(analysis.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2 border-t shrink-0">
          <span className="text-xs text-muted-foreground">
            {totalPages > 1
              ? m['ai_summary.analyses_page']({ page: String(currentPage) })
              : `${total} ${total === 1 ? 'analysis' : 'analyses'}`}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasPrevious}
              onClick={() => setOffset(offset - PAGE_SIZE)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasNext}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* JSON panel — full width on mobile when an item is selected */}
      <div className={`flex-1 min-w-0 ${!selectedId ? 'hidden md:block' : 'block'}`}>
        {selected ? (
          <div className="md:h-full max-h-[50vh] md:max-h-none overflow-y-auto rounded-lg border bg-card p-4">
            {/* Mobile back button */}
            <div className="md:hidden flex items-center gap-2 pb-3 mb-3 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{formatDate(selected.weekStart)}</span>
            </div>
            <JsonDisplay data={selected.analysis} />
          </div>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full text-sm text-muted-foreground">
            Select an analysis
          </div>
        )}
      </div>
    </div>
  )
}
