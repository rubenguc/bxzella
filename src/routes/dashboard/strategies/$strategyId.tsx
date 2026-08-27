import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, LoaderCircle } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { fetchStrategyPlaybook } from '#/features/strategies/service'
import { StrategyOverview } from '#/features/strategies/components/strategy-detail/overview'
import { StrategyPlaybookRules } from '#/features/strategies/components/strategy-detail/playbook-rules'
import { StrategyExecutedTrades } from '#/features/strategies/components/strategy-detail/executed-trades'
import { useUserConfig } from '#/store/user-config'

export const Route = createFileRoute('/dashboard/strategies/$strategyId')({
  component: StrategyDetail,
})

function StrategyDetail() {
  const { strategyId } = Route.useParams()
  const { selectedAccount, coin } = useUserConfig()

  const { data: strategy, isLoading } = useQuery({
    queryKey: ['strategy-playbook', strategyId],
    queryFn: () => fetchStrategyPlaybook(strategyId),
  })

  if (!selectedAccount) {
    return (
      <p className="text-center text-xl text-muted-foreground">
        {m['accounts.select_account']()}
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!strategy) {
    return (
      <p className="text-center text-xl text-muted-foreground">
        {m['strategies.not_found']()}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/strategies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{strategy.title}</h2>
          {strategy.description && (
            <p className="text-sm text-muted-foreground truncate">
              {strategy.description}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{m['strategies.overview']()}</TabsTrigger>
          <TabsTrigger value="playbook">{m['strategies.playbook_rules']()}</TabsTrigger>
          <TabsTrigger value="trades">{m['strategies.executed_trades']()}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <StrategyOverview
            strategyId={strategyId}
            accountId={selectedAccount.id}
            coin={coin}
          />
        </TabsContent>
        <TabsContent value="playbook" className="mt-4">
          <StrategyPlaybookRules
            strategyId={strategyId}
            accountId={selectedAccount.id}
            coin={coin}
          />
        </TabsContent>
        <TabsContent value="trades" className="mt-4">
          <StrategyExecutedTrades
            strategyId={strategyId}
            accountId={selectedAccount.id}
            coin={coin}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}