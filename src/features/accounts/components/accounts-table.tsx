"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CustomTable } from "@/components/custom-table";
import { DataTableRowActions } from "@/components/data-table-row-actions";
import { useAccounts } from "@/features/accounts/context/accounts-context";
import { useGetAccounts } from "@/features/accounts/hooks/useGetAccounts";
import type { AccountDocument } from "@/features/accounts/interfaces/accounts-interfaces";

function ProviderImage({ provider }: { provider: string }) {
  const imgSrc =
    provider === "bitunix"
      ? "/assets/providers/bitunix.webp"
      : "/assets/providers/bingx.jpeg";

  return (
    <img
      src={imgSrc}
      alt={provider}
      className="h-5 w-5 rounded-full object-cover"
    />
  );
}

export function AccountsTable() {
  const t = useTranslations("accounts");
  const { setOpen, setCurrentRow } = useAccounts();

  const columns: ColumnDef<AccountDocument>[] = [
    {
      header: t("name"),
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      header: t("provider"),
      accessorKey: "provider",
      cell: ({ row }) => {
        const provider = row.getValue("provider") as string;
        return (
          <div className="flex items-center gap-2">
            <ProviderImage provider={provider} />
            <span className="capitalize">{provider}</span>
          </div>
        );
      },
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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-4"
    >
      <CustomTable
        containerClassName="rounded-xl border bg-card shadow-sm overflow-hidden"
        table={table}
        columnsLength={columns.length}
        noDataMessage={t("no_accounts")}
        showSkeleton={!data || isLoading}
        showPagination
      />
    </motion.div>
  );
}
