import { getAISummary } from "@/features/ai-summary/services/ai-summary-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { useQuery } from "@tanstack/react-query";
import { AISummaryDocument } from "@/features/ai-summary/interfaces/ai-summary-interfaces";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import { CustomTable } from "@/components/custom-table";
import { transformTimeToLocalDate } from "@/utils/date-utils";
import { useAISummaryContext } from "@/features/ai-summary/context/ai-summary-context";

export function AISummaryTable() {
  const { setCurrentAISummary } = useAISummaryContext();

  const t = useTranslations("ai_summary");
  const { selectedAccountId, coin } = useUserConfigStore();

  const columns: ColumnDef<AISummaryDocument>[] = [
    {
      header: t("week"),
      cell: ({ row }) => (
        <div className="font-medium">
          {transformTimeToLocalDate(row.original.startDate)} -{" "}
          {transformTimeToLocalDate(row.original.endDate)}
        </div>
      ),
      meta: {
        className: "text-center",
      },
    },

    {
      header: t("model"),
      accessorKey: "model",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.model}</div>
      ),
      meta: {
        className: "text-center",
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          onClick={() => setCurrentAISummary(row.original)}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      ),
    },
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "ai-summary",
      selectedAccountId,
      coin,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      getAISummary({
        accountId: selectedAccountId,
        coin,
        page: pagination.pageIndex,
        limit: pagination.pageSize,
      }),
    enabled: !!selectedAccountId,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <>
      <p className="mb-3 text-xl">{t("last_summaries")}</p>
      <div className="space-y-4">
        <CustomTable
          containerClassName="rounded-md border"
          table={table}
          columnsLength={columns.length}
          noDataMessage={t("no_summaries")}
          showSkeleton={
            !!selectedAccountId && ((!data as boolean) || isLoading)
          }
          showPagination
        />
      </div>
    </>
  );
}
