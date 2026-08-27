import { useQuery } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { Profit } from '#/components/Profit'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { fetchStrategyRuleStats } from '#/features/strategies/service'
import type { Coin } from '#/features/exchange-providers/types'

interface Props {
  strategyId: string
  accountId: string
  coin: Coin
}

export function StrategyPlaybookRules({ strategyId, accountId, coin }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['strategy-rules', strategyId, accountId, coin],
    queryFn: () => fetchStrategyRuleStats(strategyId, accountId, coin),
  })

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.groups.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        {m['strategies.no_rules']()}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {m['strategies.total_trades']()}: {data.totalTrades}
      </p>

      {data.groups.map((group) => (
        <div key={group.ruleGroupId} className="space-y-2">
          <h3 className="font-semibold">{group.title}</h3>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">{m['strategies.rule']()}</TableHead>
                  <TableHead className="text-center">{m['strategies.follow_rate']()}</TableHead>
                  <TableHead className="text-center">{m['strategies.net_pnl']()}</TableHead>
                  <TableHead className="text-center">{m['strategies.profit_factor']()}</TableHead>
                  <TableHead className="text-center">{m['strategies.win_rate']()}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.rules.map((rule) => (
                  <TableRow key={rule.ruleId}>
                    <TableCell className="text-left font-medium">
                      {rule.title}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {rule.followRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Profit netProfit={rule.netPnL} />
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {rule.profitFactor.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {rule.winRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  )
}