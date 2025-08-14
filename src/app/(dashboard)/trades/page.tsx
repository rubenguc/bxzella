import { TradeInfoDialog } from "@/features/trades/components/trades-info-dialog";
import { TradesHeader } from "@/features/trades/components/trades-header";
import { TradesTable } from "@/features/trades/components/trades-table";
import TradesProvider from "@/features/trades/context/trades-context";

export default function Trades() {
  return (
    <TradesProvider>
      <TradesHeader />
      <TradesTable />
      <TradeInfoDialog />
    </TradesProvider>
  );
}
