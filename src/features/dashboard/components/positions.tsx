import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpenPositions } from "./open-positions";
import { RecentTrades } from "./recent-trades";

export function Positions() {
  const t = useTranslations("dashboard");

  return (
    <Tabs defaultValue="recent_trades">
      <Card>
        <CardHeader>
          <TabsList>
            <TabsTrigger value="recent_trades">
              {t("recent_trades.recent_trades")}
            </TabsTrigger>
            <TabsTrigger value="open_positions">
              {t("open_positions.open_positions")}
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
  );
}
