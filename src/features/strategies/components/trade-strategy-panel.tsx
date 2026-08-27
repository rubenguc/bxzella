import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  fetchStrategyOptions,
  fetchStrategyPlaybook,
  fetchTradeRuleChecks,
} from '#/features/strategies/service'
import { setTradeStrategyAction } from '#/features/strategies/server-actions'

interface Props {
  tradeId: string
  positionId: string
  currentStrategyId: string | null
}

export function TradeStrategyPanel({
  tradeId,
  positionId,
  currentStrategyId,
}: Props) {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(currentStrategyId)
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)

  const { data: strategies, isLoading: loadingOptions } = useQuery({
    queryKey: ['strategy-options'],
    queryFn: fetchStrategyOptions,
  })

  const { data: playbook, isLoading: loadingPlaybook } = useQuery({
    queryKey: ['strategy-playbook', selectedId],
    queryFn: () => fetchStrategyPlaybook(selectedId!),
    enabled: !!selectedId,
  })

  const { data: existingChecks } = useQuery({
    queryKey: ['trade-rule-checks', tradeId],
    queryFn: () => fetchTradeRuleChecks(tradeId),
    enabled: !!selectedId && selectedId === currentStrategyId,
  })

  // Initialize the checks map whenever the playbook (or persisted checks) changes
  useEffect(() => {
    if (!playbook) return

    const map: Record<string, boolean> = {}
    for (const group of playbook.ruleGroups) {
      for (const rule of group.rules) map[rule.id] = false
    }

    if (selectedId === currentStrategyId && existingChecks) {
      for (const check of existingChecks) {
        if (check.ruleId in map) map[check.ruleId] = check.followed
      }
    }

    setChecks(map)
  }, [playbook, existingChecks, selectedId, currentStrategyId])

  const toggleRule = (ruleId: string) => {
    setChecks((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }))
  }

  const handleSave = async () => {
    const checksList = playbook
      ? playbook.ruleGroups.flatMap((group) =>
          group.rules.map((rule) => ({
            ruleId: rule.id,
            followed: !!checks[rule.id],
          })),
        )
      : []

    setIsSaving(true)
    try {
      await setTradeStrategyAction({
        data: { tradeId, strategyId: selectedId, checks: checksList },
      })
      await queryClient.invalidateQueries({
        queryKey: ['trade-details', positionId],
      })
      await queryClient.invalidateQueries({ queryKey: ['strategies'] })
      toast.success(m['strategies.saved_toast']())
    } finally {
      setIsSaving(false)
    }
  }

  if (loadingOptions) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <div className="space-y-4">
        {strategies && strategies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {m['strategies.no_strategies']()}{' '}
            <Link to="/dashboard/strategies" className="underline">
              {m['strategies.create']()}
            </Link>
          </p>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>{m['strategies.assign_strategy']()}</Label>
              <Select
                value={selectedId ?? 'none'}
                onValueChange={(v) => setSelectedId(v === 'none' ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{m['strategies.none']()}</SelectItem>
                  {strategies?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedId && loadingPlaybook && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}

            {selectedId && playbook && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {playbook.ruleGroups.map((group) => (
                    <div key={group.id} className="space-y-1.5">
                      <p className="text-sm font-medium">{group.title}</p>
                      <div className="space-y-1.5">
                        {group.rules.map((rule) => (
                          <label
                            key={rule.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={!!checks[rule.id]}
                              onChange={() => toggleRule(rule.id)}
                              className="size-4 accent-primary"
                            />
                            {rule.title}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {m['accounts.saving_action']()}
                    </>
                  ) : (
                    m['strategies.save_changes']()
                  )}
                </Button>
              </div>
            )}
          </>
        )}
    </div>
  )
}