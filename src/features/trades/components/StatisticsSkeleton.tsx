import { Skeleton } from "@/components/ui/skeleton";

export function StatisticsSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Skeleton className="col-span-1 h-26 max-h-40" />
        <Skeleton className="col-span-1 h-26 max-h-40" />
        <Skeleton className="col-span-1 h-26 max-h-40" />
        <Skeleton className="col-span-1 h-26 max-h-40" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Skeleton className="col-span-1 h-26 max-h-40" />
        <Skeleton className="col-span-1 h-26 max-h-40" />
      </div>
    </div>
  );
}
