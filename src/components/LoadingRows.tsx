"use client";

import { motion } from "motion/react";

interface LoadingRowsProps {
  rows: number;
  columns: number;
}

export const LoadingRows = ({ rows, columns }: LoadingRowsProps) => {
  return (
    <>
      {Array(rows)
        .fill(null)
        .map((_, index) => (
          <motion.tr
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors group/row"
          >
            <td
              className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
              colSpan={columns}
            >
              <div className="h-7 bg-gray-400/20 animate-pulse" />
            </td>
          </motion.tr>
        ))}
    </>
  );
};
