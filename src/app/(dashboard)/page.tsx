"use client";

import { Card, CardContent } from "@/components/ui/card";
import { OpenPositions } from "@/features/trades/components/OpenPositions";
import { RecentTrades } from "@/features/trades/components/RecentTrades";
import { useUserConfigStore } from "@/store/user-config-store";
import { formatDecimal } from "@/utils/number-utils";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

async function fetchStatistics(
  uid: string,
  startDate: number,
  endDate: number,
) {
  const res = await fetch(
    `/api/statistics?account_id=${uid}&startDate=${startDate}&endDate=${endDate}`,
  );
  return res.json();
}

const actualDate = new Date();
const dateLess30Days = new Date(actualDate);
dateLess30Days.setDate(dateLess30Days.getDate() - 30);
const startDate = dateLess30Days.getTime();
const currentDate = new Date().getTime();

export default function Dashboard() {
  const { selectedAccountId } = useUserConfigStore();

  const { data, isLoading } = useQuery({
    queryKey: ["statistics", selectedAccountId, startDate, currentDate],
    queryFn: () => fetchStatistics(selectedAccountId, startDate, currentDate),
    enabled: !!selectedAccountId,
  });

  if (isLoading) return;

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4  gap-4">
        <Card className="max-h-26">
          <CardContent>
            <p>Net PnL</p>
            <p>{data?.netPnL || 0}</p>
          </CardContent>
        </Card>

        <Card className="max-h-26">
          <CardContent>
            <div className="flex justify-between gap-5 overflow-hidden">
              <div>
                <p>ProfiFactor</p>
                <p>{formatDecimal(data?.profitFactor?.value || 0)}</p>
              </div>
              {data?.profitFactor?.value && (
                <div className="w-40 h-40 scale-30 -translate-y-12">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "wins",
                            value: data?.profitFactor?.sumWin,
                          },
                          {
                            name: "losses",
                            value: data?.profitFactor?.sumLoss,
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
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="max-h-26">
          <CardContent>
            <div className="flex justify-between gap-5 overflow-hidden">
              <div>
                <p>Trade win %</p>
                <p>{formatDecimal(data?.tradeWin?.value || 0)}</p>
              </div>
              {data?.profitFactor?.value && (
                <div className="w-40 h-40 scale-40 -translate-y-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "wins",
                            value: data?.tradeWin?.totalWin,
                          },
                          {
                            name: "losses",
                            value: data?.tradeWin?.totalLoss,
                          },
                        ]}
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label
                        labelLine
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

        <Card className="max-h-26">
          <CardContent>
            <div className="flex justify-between gap-5 overflow-hidden">
              <div>
                <p>Avg win/loss trade %</p>
                <p>{formatDecimal(data?.avgWinLoss?.value || 0)}</p>
              </div>
              {data?.profitFactor?.value && (
                <div className="w-40 h-40 scale-40 -translate-y-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "wins",
                            value: data?.avgWinLoss?.avgWin,
                          },
                          {
                            name: "losses",
                            value: data?.avgWinLoss?.avgLoss,
                          },
                        ]}
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label
                        labelLine
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
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <OpenPositions />
        <RecentTrades />
      </div>
    </div>
  );
}
