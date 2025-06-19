import { flexRender } from "@tanstack/react-table";
import { Table as ITable } from "@tanstack/table-core";
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
              <TableRow key={headerGroup.id} className="group/row">
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row"
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
                </TableRow>
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
      {showPagination && <DataTablePagination table={table} />}
    </>
  );
}
