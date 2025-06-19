"use client";

import { useQuery } from "@tanstack/react-query";
import { IAccountModel } from "../model/accounts";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { DataTableRowActions } from "@/components/data-table-row-actions";
import { useAccounts } from "../context/accounts-context";
import { useTranslations } from "next-intl";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { CustomTable } from "@/components/custom-table";

export function AccountsTable() {
  const t = useTranslations("accounts");
  const { setOpen, setCurrentRow } = useAccounts();

  const columns: ColumnDef<IAccountModel>[] = [
    {
      header: t("name"),
      accessorKey: "name",
    },
    {
      header: t("uid"),
      accessorKey: "uid",
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
