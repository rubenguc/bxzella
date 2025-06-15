import { Card, CardContent } from "@/components/ui/card";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";

interface NetPNLProps {
  netPnL: number;
}

export function NetPNL({ netPnL }: NetPNLProps) {
  const coin = useUserConfigStore((state) => state.coin);
  const t = useTranslations("dashboard.statistics");

  return (
    <Card className="max-h-26">
      <CardContent>
        <p>{t("net_pnl")}</p>
        <p>
          {formatDecimal(netPnL)} {coin}
        </p>
      </CardContent>
    </Card>
  );
}
