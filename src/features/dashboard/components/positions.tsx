import { m } from "#/paraglide/messages";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import { OpenPositions } from "./open-positions";
import { RecentTrades } from "./recent-trades";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";

export function Positions() {
  return (
    <Tabs defaultValue="open_positions" className="h-full">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <TabsList>
            <TabsTrigger value="open_positions">
              {m['dashboard.open_positions.open_positions']()}
            </TabsTrigger>
            <TabsTrigger value="recent_trades">
              {m['dashboard.recent_trades.recent_trades']()}
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto">
          <TabsContent value="open_positions" className="h-full">
            <OpenPositions />
          </TabsContent>
          <TabsContent value="recent_trades" className="h-full">
            <RecentTrades />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
