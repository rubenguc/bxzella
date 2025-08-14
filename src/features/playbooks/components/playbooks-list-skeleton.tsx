import { Skeleton } from "@/components/ui/skeleton";

export const PlaybookListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2].map((card) => (
        <Skeleton
          key={card}
          className="h-[300px]   w-[396px] animate-pulse rounded-xl"
        />
      ))}
    </div>
  );
};
