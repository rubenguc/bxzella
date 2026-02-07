import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentTradesProvider from "../context/recent-trades-context";
import { OpenPositions } from "./open-positions";
import { RecentTrades } from "./recent-trades";

export function Positions() {
  const t = useTranslations("dashboard");

  return (
    <RecentTradesProvider>
      <Tabs defaultValue="open_positions">
        <Card>
          <CardHeader>
            <TabsList>
              <TabsTrigger value="open_positions">
                {t("open_positions.open_positions")}
              </TabsTrigger>
              <TabsTrigger value="recent_trades">
                {t("recent_trades.recent_trades")}
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="md:h-[420px]">
            <TabsContent value="open_positions">
              <OpenPositions />
            </TabsContent>
            <TabsContent value="recent_trades">
              <RecentTrades />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </RecentTradesProvider>
  );
}
