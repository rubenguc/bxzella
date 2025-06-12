import { Card, CardContent } from "@/components/ui/card";
import { formatDecimal } from "@/utils/number-utils";
import { useTranslations } from "next-intl";
// import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface ProfitFactorProps {
  profitFactor: {
    value: number;
    sumWin: number;
    sumLoss: number;
  };
}

export function ProfitFactor({ profitFactor }: ProfitFactorProps) {
  const t = useTranslations("dashboard.statistics");

  return (
    <Card className="max-h-26">
      <CardContent>
        <div className="flex justify-between gap-5 overflow-hidden">
          <div>
            <p>{t("profit_factor")}</p>
            <p>{formatDecimal(profitFactor?.value || 0)}</p>
          </div>
          {/* {profitFactor?.value && (
            <div className="w-40 h-40 scale-30 -translate-y-12">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "wins",
                        value: profitFactor?.sumWin,
                      },
                      {
                        name: "losses",
                        value: profitFactor?.sumLoss,
                      },
                    ]}
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
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}
