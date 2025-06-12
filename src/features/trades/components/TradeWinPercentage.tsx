import { Card, CardContent } from "@/components/ui/card";
import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface TradeWinPercentageProps {
  tradeWin: {
    value: number;
    totalWin: number;
    totalLoss: number;
  };
}

export function TradeWinPercentage({ tradeWin }: TradeWinPercentageProps) {
  const t = useTranslations("dashboard.statistics");

  return (
    <Card className="max-h-26">
      <CardContent>
        <div className="flex justify-between gap-5 overflow-hidden">
          <div>
            <p>{t("trade_win_percentage")}</p>
            <p>{formatDecimal(tradeWin?.value || 0)}</p>
          </div>
          {tradeWin?.value > 0 && (
            <div className="w-40 h-40 scale-40 -translate-y-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "wins",
                        value: tradeWin?.totalWin || 0,
                      },
                      {
                        name: "losses",
                        value: tradeWin?.totalLoss || 0,
                      },
                    ]}
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell strokeWidth={0} fill={"var(--color-green-500)"} />
                    <Cell strokeWidth={0} fill={"var(--color-red-500)"} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
