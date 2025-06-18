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
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-1 flex flex-col gap-1.5">
            <p className="text-gray-300 text-sm">{t("trade_win_percentage")}</p>
            <p className="text-xl">{formatDecimal(tradeWin?.value || 0)}%</p>
          </div>
          {tradeWin?.value > 0 && (
            <div className="col-span-1 min-w-[170px]">
              <ResponsiveContainer
                width="100%"
                height={160}
                className="scale-35 -mt-10"
              >
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
