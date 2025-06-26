import { Skeleton } from "@/components/ui/skeleton";

export function AISummaryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* First paragraph */}
      <Skeleton className="h-4 w-full" />

      {/* Header 1 */}
      <Skeleton className="h-6 w-3/4 rounded" />

      {/* Paragraph */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />

      {/* Header 2 */}
      <Skeleton className="h-5 w-2/4 rounded" />

      {/* List items */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-2 pl-5">
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}

      {/* Header 3 */}
      <Skeleton className="h-5 w-2/4 rounded" />

      {/* List items */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-2 pl-5">
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}

      {/* Header 4 */}
      <Skeleton className="h-5 w-2/4 rounded" />

      {/* List items */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-2 pl-5">
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}

      {/* Header 5 */}
      <Skeleton className="h-5 w-2/4 rounded" />

      {/* Ordered list items */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-2 pl-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}
