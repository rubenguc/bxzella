import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface NetPNLProps {
  netPnL: number;
}

export function NetPNL({ netPnL }: NetPNLProps) {
  const t = useTranslations("dashboard.statistics");

  return (
    <Card className="max-h-26">
      <CardContent>
        <p>{t("net_pnl")}</p>
        <p>{netPnL}</p>
      </CardContent>
    </Card>
  );
}
