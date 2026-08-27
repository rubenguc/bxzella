import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowRight,
  ChevronRight,
  GripVertical,
  Loader2,
  Plus,
  Target,
  Trash2,
} from 'lucide-react'

import { m } from '#/paraglide/messages'
import { cn } from '#/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import { Card, CardContent } from '#/components/ui/card'
import {
  strategyFormSchema,
  type StrategyForm,
} from '#/features/strategies/validation'
import {
  createStrategyAction,
  updateStrategyAction,
} from '#/features/strategies/server-actions'
import { fetchStrategyPlaybook } from '#/features/strategies/service'
import type { StrategyWithStats } from '#/features/strategies/types'

interface RuleDraft {
  id?: string
  tempId: string
  title: string
}

interface RuleGroupDraft {
  id?: string
  tempId: string
  title: string
  rules: RuleDraft[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: StrategyWithStats | null
}

function StepBadge({
  active,
  done,
  children,
}: {
  active: boolean
  done?: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : done
            ? 'bg-muted'
            : 'bg-muted text-muted-foreground',
      )}
    >
      {children}
    </span>
  )
}

const borderlessInputClassName =
  'border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto px-2'

function SortableRuleRow({
  rule,
  onTitleChange,
  onRemove,
}: {
  rule: RuleDraft
  onTitleChange: (value: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.tempId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 pl-6 pr-3 py-2',
        isDragging && 'opacity-60',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label={m['strategies.drag_handle']()}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={rule.title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={m['strategies.rule_title_placeholder']()}
        autoComplete="off"
        className={cn('flex-1', borderlessInputClassName)}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function SortableGroupCard({
  group,
  onTitleChange,
  onRemove,
  onAddRule,
  onRuleTitleChange,
  onRuleRemove,
}: {
  group: RuleGroupDraft
  onTitleChange: (value: string) => void
  onRemove: () => void
  onAddRule: () => void
  onRuleTitleChange: (ruleId: string, value: string) => void
  onRuleRemove: (ruleId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.tempId })

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('p-0 overflow-hidden', isDragging && 'opacity-60')}
    >
      <CardContent className="p-0">
        {/* Group header: drag handle + editable title + remove */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            aria-label={m['strategies.drag_handle']()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <Input
              value={group.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={m['strategies.rule_group_title_placeholder']()}
              autoComplete="off"
              className={cn('font-medium', borderlessInputClassName)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="border-t" />

        {/* Rules */}
        <div className="divide-y divide-border">
          <SortableContext
            items={group.rules.map((r) => r.tempId)}
            strategy={verticalListSortingStrategy}
          >
            {group.rules.map((rule) => (
              <SortableRuleRow
                key={rule.tempId}
                rule={rule}
                onTitleChange={(value) => onRuleTitleChange(rule.tempId, value)}
                onRemove={() => onRuleRemove(rule.tempId)}
              />
            ))}
          </SortableContext>
        </div>

        {/* Footer: add rule */}
        <div className="px-3 py-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-primary hover:text-primary"
            onClick={onAddRule}
          >
            <Plus className="h-4 w-4" />
            {m['strategies.add_rule']()}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function StrategyDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const [step, setStep] = useState<'details' | 'rules'>('details')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ruleGroups, setRuleGroups] = useState<RuleGroupDraft[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  // Load playbook when opening in edit mode; reset when creating
  useEffect(() => {
    if (!open) return
    setError(null)
    setStep('details')

    if (isEdit && currentRow) {
      setIsLoading(true)
      fetchStrategyPlaybook(currentRow.id)
        .then((pb) => {
          setTitle(pb.title)
          setDescription(pb.description ?? '')
          setRuleGroups(
            pb.ruleGroups.map((g) => ({
              id: g.id,
              tempId: crypto.randomUUID(),
              title: g.title,
              rules: g.rules.map((r) => ({
                id: r.id,
                tempId: crypto.randomUUID(),
                title: r.title,
              })),
            })),
          )
        })
        .catch(() => setError(m['errors.server_error']()))
        .finally(() => setIsLoading(false))
    } else {
      setTitle('')
      setDescription('')
      setRuleGroups([])
    }
  }, [open, isEdit, currentRow])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleNext = () => {
    if (!title.trim()) {
      setError(m['strategies.title_required']())
      return
    }
    setError(null)
    setStep('rules')
  }

  const handleBack = () => {
    setError(null)
    setStep('details')
  }

  const addRuleGroup = () => {
    setRuleGroups((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        title: `${m['strategies.rule_group']()} ${prev.length + 1}`,
        rules: [],
      },
    ])
  }

  const updateRuleGroupTitle = (groupId: string, value: string) => {
    setRuleGroups((prev) =>
      prev.map((g) => (g.tempId === groupId ? { ...g, title: value } : g)),
    )
  }

  const removeRuleGroup = (groupId: string) => {
    setRuleGroups((prev) => prev.filter((g) => g.tempId !== groupId))
  }

  const addRule = (groupId: string) => {
    setRuleGroups((prev) =>
      prev.map((g) =>
        g.tempId === groupId
          ? { ...g, rules: [...g.rules, { tempId: crypto.randomUUID(), title: '' }] }
          : g,
      ),
    )
  }

  const updateRuleTitle = (groupId: string, ruleId: string, value: string) => {
    setRuleGroups((prev) =>
      prev.map((g) =>
        g.tempId === groupId
          ? {
              ...g,
              rules: g.rules.map((r) =>
                r.tempId === ruleId ? { ...r, title: value } : r,
              ),
            }
          : g,
      ),
    )
  }

  const removeRule = (groupId: string, ruleId: string) => {
    setRuleGroups((prev) =>
      prev.map((g) =>
        g.tempId === groupId
          ? { ...g, rules: g.rules.filter((r) => r.tempId !== ruleId) }
          : g,
      ),
    )
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const groupIds = ruleGroups.map((g) => g.tempId)

    // Dragging a group → reorder groups
    if (groupIds.includes(active.id as string)) {
      setRuleGroups((prev) =>
        arrayMove(
          prev,
          groupIds.indexOf(active.id as string),
          groupIds.indexOf(over.id as string),
        ),
      )
      return
    }

    // Dragging a rule → reorder within its group
    setRuleGroups((prev) =>
      prev.map((g) => {
        const ruleIds = g.rules.map((r) => r.tempId)
        if (!ruleIds.includes(active.id as string)) return g
        if (!ruleIds.includes(over.id as string)) return g
        return {
          ...g,
          rules: arrayMove(
            g.rules,
            ruleIds.indexOf(active.id as string),
            ruleIds.indexOf(over.id as string),
          ),
        }
      }),
    )
  }

  const handleSubmit = async () => {
    const totalRules = ruleGroups.reduce((n, g) => n + g.rules.length, 0)
    if (totalRules === 0) {
      setError(m['strategies.at_least_one_rule']())
      return
    }

    const parsed = strategyFormSchema.safeParse({ title, description, ruleGroups })
    if (!parsed.success) {
      setError(m['strategies.form_error']())
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const data: StrategyForm = parsed.data
      const result =
        isEdit && currentRow
          ? await updateStrategyAction({ data: { id: currentRow.id, data } })
          : await createStrategyAction({ data })

      if (!result.success) {
        setError(
          result.error === 'invalid_strategy_data'
            ? m['strategies.form_error']()
            : m['errors.server_error'](),
        )
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['strategies'] })
      toast.success(
        m[isEdit ? 'strategies.updated_toast' : 'strategies.created_toast'](),
      )
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            {m[isEdit ? 'strategies.edit_strategy' : 'strategies.create']()}
          </DialogTitle>
          <DialogDescription>
            {m['strategies.form_description']()}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="px-6 pt-4 flex items-center gap-2">
              <StepBadge active={step === 'details'} done={step === 'rules'}>
                1. {m['strategies.form_details']()}
              </StepBadge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <StepBadge active={step === 'rules'}>
                2. {m['strategies.form_rules']()}
              </StepBadge>
            </div>

            {/* Step content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
              {step === 'details' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="strategy-title">
                      {m['strategies.title']()} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="strategy-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={m['strategies.title_placeholder']()}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="strategy-description">
                      {m['strategies.description']()}{' '}
                      <span className="text-muted-foreground">
                        ({m['strategies.optional']()})
                      </span>
                    </Label>
                    <Textarea
                      id="strategy-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={m['strategies.description_placeholder']()}
                      rows={4}
                      className="min-h-24"
                    />
                  </div>
                </>
              )}

              {step === 'rules' && (
                <>
                  <div className="flex justify-end">
                    <Button className="gap-1" onClick={addRuleGroup}>
                      <Plus className="h-4 w-4" />
                      {m['strategies.add_rule_group']()}
                    </Button>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                  <SortableContext
                    items={ruleGroups.map((g) => g.tempId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {ruleGroups.map((group) => (
                        <SortableGroupCard
                          key={group.tempId}
                          group={group}
                          onTitleChange={(value) =>
                            updateRuleGroupTitle(group.tempId, value)
                          }
                          onRemove={() => removeRuleGroup(group.tempId)}
                          onAddRule={() => addRule(group.tempId)}
                          onRuleTitleChange={(ruleId, value) =>
                            updateRuleTitle(group.tempId, ruleId, value)
                          }
                          onRuleRemove={(ruleId) =>
                            removeRule(group.tempId, ruleId)
                          }
                        />
                      ))}

                      {ruleGroups.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          {m['strategies.no_rule_groups']()}
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
                </>
              )}
            </div>

            {error && (
              <div className="mx-6 mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter className="px-6 py-4 border-t">
              {step === 'details' ? (
                <>
                  <Button variant="outline" onClick={handleClose}>
                    {m['common_messages.cancel']()}
                  </Button>
                  <Button onClick={handleNext}>
                    {m['strategies.next']()}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleBack}>
                    {m['strategies.back']()}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {m['accounts.saving_action']()}
                      </>
                    ) : isEdit ? (
                      m['strategies.save_changes']()
                    ) : (
                      m['strategies.create']()
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}