"use client";

import { motion } from "motion/react";
import { TradesTable } from "@/features/trades/components/trades-table";

export default function Trades() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <TradesTable />
    </motion.div>
  );
}
