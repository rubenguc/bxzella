"use client";

import { flexRender } from "@tanstack/react-table";
import { Table as ITable, RowData } from "@tanstack/table-core";
import { motion } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { LoadingRows } from "./LoadingRows";
import { DataTablePagination } from "./data-table-pagination";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string;
  }
}

interface CustomTableProps<T> {
  table: ITable<T>;
  columnsLength: number;
  noDataMessage: string;
  showSkeleton?: boolean;
  skeletonRows?: number;
  showPagination?: boolean;
  containerClassName?: string;
}

export function CustomTable<T>({
  table,
  columnsLength,
  noDataMessage,
  showSkeleton = false,
  skeletonRows = 5,
  showPagination = false,
  containerClassName = "",
}: CustomTableProps<T>) {
  return (
    <>
      <div className={containerClassName}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="group/row border-b bg-muted/30"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      aria-colspan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row hover:bg-accent/50 data-[state=selected]:bg-accent border-b transition-colors last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ""}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <>
                {showSkeleton ? (
                  <LoadingRows
                    rows={skeletonRows}
                    columns={table.getAllColumns().length}
                  />
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columnsLength}
                      className="h-24 text-center"
                    >
                      {noDataMessage}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <DataTablePagination table={table} />
        </motion.div>
      )}
    </>
  );
}
