import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpenPositions } from "./open-positions";
import { RecentTrades } from "./recent-trades";

export function Positions() {
  const t = useTranslations("dashboard");

  return (
    <Tabs defaultValue="account">
      <Card>
        <CardHeader>
          <TabsList>
            <TabsTrigger value="account">
              {t("open_positions.open_positions")}
            </TabsTrigger>
            <TabsTrigger value="password">
              {t("recent_trades.recent_trades")}
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="h-[420px]">
          <TabsContent value="account">
            <OpenPositions />
          </TabsContent>
          <TabsContent value="password">
            <RecentTrades />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
