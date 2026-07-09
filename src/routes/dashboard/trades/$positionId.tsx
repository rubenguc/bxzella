import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { TradeInfo } from "#/features/trades/components/trade-info";
import { TradeChart } from "#/features/trades/components/trade-chart";
import { TradeNotebook } from "#/features/trades/components/trade-notebook";
import { useUserConfig } from "#/store/user-config";
import { formatDate } from "#/lib/date-utils";
import { fetchTradeById } from "#/features/trades/service";
import { transformSymbol } from "#/features/trades/helpers";

export const Route = createFileRoute("/dashboard/trades/$positionId")({
  component: TradeDetails,
});

function TradeDetails() {
  const { positionId } = Route.useParams();
  const { selectedAccount, coin } = useUserConfig();

  const { data, isLoading } = useQuery({
    queryKey: ["trade-details", positionId],
    queryFn: () => fetchTradeById(selectedAccount!.id, positionId),
    enabled: !!selectedAccount?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{m["common_messages.loading"]()}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{m["trade_info.no_trade_data"]()}</p>
      </div>
    );
  }

  const formattedOpenTime = formatDate(data.openTime);
  const formattedUpdateTime = formatDate(data.updateTime);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/trades">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 bg-card p-2 rounded-xl border flex-1">
          <h1 className="font-bold text-2xl">
            {transformSymbol(data.symbol)}
          </h1>
          <span className="text-sm text-muted-foreground">
            {formattedOpenTime === formattedUpdateTime
              ? formattedOpenTime
              : `${formattedOpenTime} - ${formattedUpdateTime}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Tabs className="lg:w-3/10 h-fit" defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">{m["trade_info.info"]()}</TabsTrigger>
          </TabsList>
          <TabsContent
            value="info"
            className="border rounded-xl py-2 px-4 bg-card"
          >
            <TradeInfo trade={data} />
          </TabsContent>
        </Tabs>

        <Card className="lg:w-7/10 py-3">
          <CardContent className="flex flex-col flex-1 px-3 space-y-4">
            <TradeChart
              coin={coin}
              symbol={data.symbol}
              openTime={data.openTime as unknown as string}
              updateTime={data.updateTime as unknown as string}
              avgClosePrice={data.avgClosePrice ?? ""}
              avgPrice={data.avgPrice}
              positionSide={data.positionSide}
              netProfit={data.netProfit}
              accountId={selectedAccount!.id}
            />

            <TradeNotebook
              tradeId={data.id}
              accountId={selectedAccount!.id}
              coin={coin}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
