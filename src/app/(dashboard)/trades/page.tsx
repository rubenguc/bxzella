import { TradeInfoDialog } from "@/features/trades/components/TradeInfoDialog";
import { TradesHeader } from "@/features/trades/components/TradesHeader";
import { TradesTable } from "@/features/trades/components/TradesTable";
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
