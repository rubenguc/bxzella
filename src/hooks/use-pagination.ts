import { useState } from "react";

export function usePagination(
  { initialPageIndex = 0, initialPageSize = 10 } = {
    initialPageIndex: 0,
    initialPageSize: 10,
  },
) {
  const [pagination, setPagination] = useState({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  return {
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    setPagination,
  };
}
