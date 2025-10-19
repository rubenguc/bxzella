"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CustomTable } from "@/components/custom-table";
import { DataTableRowActions } from "@/components/data-table-row-actions";
import { useAccounts } from "@/features/accounts/context/accounts-context";
import { useGetAccounts } from "@/features/accounts/hooks/useGetAccounts";
import type { AccountDocument } from "@/features/accounts/interfaces/accounts-interfaces";

export function AccountsTable() {
  const t = useTranslations("accounts");
  const { setOpen, setCurrentRow } = useAccounts();

  const columns: ColumnDef<AccountDocument>[] = [
    {
      header: t("name"),
      accessorKey: "name",
    },
    {
      header: t("provider"),
      accessorKey: "provider",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          onEdit={() => {
            setOpen("edit");
            setCurrentRow(row.original);
          }}
          onDelete={() => {
            setOpen("delete");
            setCurrentRow(row.original);
          }}
        />
      ),
    },
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useGetAccounts({
    limit: pagination.pageSize,
    page: pagination.pageIndex,
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
    <div className="space-y-4">
      <CustomTable
        containerClassName="rounded-md border"
        table={table}
        columnsLength={columns.length}
        noDataMessage={t("no_accounts")}
        showSkeleton={!data || isLoading}
        showPagination
      />
    </div>
  );
}
