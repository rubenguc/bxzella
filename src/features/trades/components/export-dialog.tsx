import { useState } from "react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Calendar as CalendarIcon, Download } from "lucide-react"
import { es } from "react-day-picker/locale"
import type { DateRange } from "react-day-picker"

import { m } from "#/paraglide/messages"
import { Button } from "#/components/ui/button"
import { Calendar } from "#/components/ui/calendar"
import { Label } from "#/components/ui/label"
import { Switch } from "#/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs"
import { Input } from "#/components/ui/input"
import { exportTradesAction } from "#/features/trades/server-actions"
import type { Coin } from "#/features/exchange-providers/types"

const LOCALES: Record<string, typeof es | undefined> = { es }

const predefinedRanges = [
  {
    label: m["trade_export.today"],
    range: () => { const t = new Date(); return { from: t, to: t } },
  },
  {
    label: m["trade_export.this_week"],
    range: () => {
      const t = new Date()
      const weekEnd = endOfWeek(t, { weekStartsOn: 0 })
      return { from: startOfWeek(t, { weekStartsOn: 0 }), to: weekEnd > t ? t : weekEnd }
    },
  },
  {
    label: m["trade_export.this_month"],
    range: () => {
      const t = new Date()
      const monthEnd = endOfMonth(t)
      return { from: startOfMonth(t), to: monthEnd > t ? t : monthEnd }
    },
  },
  {
    label: m["trade_export.last_30_days"],
    range: () => { const t = new Date(); return { from: subDays(t, 30), to: t } },
  },
  {
    label: m["trade_export.last_month"],
    range: () => {
      const t = new Date()
      const firstDay = startOfMonth(subMonths(t, 1))
      const lastDay = endOfMonth(subMonths(t, 1))
      return { from: firstDay, to: lastDay > t ? t : lastDay }
    },
  },
]

const QUANTITY_OPTIONS = [10, 30, 50, 100]

interface Props {
  accountId: string
  coin: Coin
  accountName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function sanitizeFilename(name: string): string {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "")
}

export function ExportTradesDialog({ accountId, coin, accountName, open, onOpenChange }: Props) {
  const [scope, setScope] = useState<"all" | "custom">("all")
  const [mode, setMode] = useState<"dateRange" | "quantity">("dateRange")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null)
  const [customQtyInput, setCustomQtyInput] = useState("")
  const [includeNotebooks, setIncludeNotebooks] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const resetState = () => {
    setScope("all")
    setMode("dateRange")
    setDateRange(undefined)
    setSelectedQuantity(null)
    setCustomQtyInput("")
    setIncludeNotebooks(true)
    setIsExporting(false)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params: Record<string, unknown> = { accountId, coin, scope, includeNotebooks }
      if (scope === "custom") {
        params.mode = mode
        if (mode === "dateRange" && dateRange?.from && dateRange?.to) {
          params.startDate = format(dateRange.from, "yyyy-MM-dd")
          params.endDate = format(dateRange.to, "yyyy-MM-dd")
        } else if (mode === "quantity") {
          params.limit = selectedQuantity ?? Number(customQtyInput)
        }
      }

      const result = await exportTradesAction({ data: params })
      if (!result.success) throw new Error(result.error)

      const json = JSON.stringify(result.data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const today = format(new Date(), "yyyy-MM-dd")
      const safeName = sanitizeFilename(accountName)
      const filename = `trades_${safeName}_${coin}_${today}.json`

      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      onOpenChange(false)
      resetState()
    } catch (err) {
      console.error("Export failed", err)
    } finally {
      setIsExporting(false)
    }
  }

  const locale = LOCALES[navigator.language.split("-")[0]]
  const formattedRange = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
    : ""

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetState(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{m["trade_export.title"]()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scope */}
          <div className="flex gap-2">
            <Button
              variant={scope === "all" ? "default" : "outline"}
              onClick={() => setScope("all")}
            >
              {m["trade_export.scope_all"]()}
            </Button>
            <Button
              variant={scope === "custom" ? "default" : "outline"}
              onClick={() => setScope("custom")}
            >
              {m["trade_export.scope_custom"]()}
            </Button>
          </div>

          {scope === "custom" && (
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "dateRange" | "quantity")}
            >
              <TabsList>
                <TabsTrigger value="dateRange">
                  {m["trade_export.date_range"]()}
                </TabsTrigger>
                <TabsTrigger value="quantity">
                  {m["trade_export.quantity"]()}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dateRange" className="pt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 justify-start">
                      <CalendarIcon className="size-4 opacity-50" />
                      <span>{formattedRange || m["trade_export.select_range"]()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="flex" align="start">
                    <Calendar
                      locale={locale}
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      disabled={[{ after: new Date() }]}
                      showOutsideDays
                    />
                    <div className="w-fit border-l p-1">
                      {predefinedRanges.map((item, i) => (
                        <DropdownMenuItem
                          key={i}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDateRange(item.range())
                          }}
                        >
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsContent>

              <TabsContent value="quantity" className="pt-2 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {QUANTITY_OPTIONS.map((q) => (
                    <Button
                      key={q}
                      variant={selectedQuantity === q ? "default" : "outline"}
                      onClick={() => { setSelectedQuantity(q); setCustomQtyInput("") }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {m["trade_export.custom"]()}:
                  </span>
                  <Input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={customQtyInput}
                    onChange={(e) => { setCustomQtyInput(e.target.value); setSelectedQuantity(null) }}
                    className="w-24"
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Include notebooks toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="include-notebooks"
              checked={includeNotebooks}
              onCheckedChange={setIncludeNotebooks}
            />
            <Label htmlFor="include-notebooks">
              {m["trade_export.include_notebooks"]()}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="size-4 mr-2" />
            {isExporting ? m["trade_export.exporting"]() : m["trade_export.download"]()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
