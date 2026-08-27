import { Plus } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/components/ui/button'
import { useStrategies } from '#/features/strategies/context'

export function StrategiesHeader() {
  const { setOpen } = useStrategies()

  return (
    <div className="mb-6 flex justify-end">
      <Button className="gap-2" onClick={() => setOpen('create')}>
        <Plus className="h-4 w-4" />
        {m['strategies.create']()}
      </Button>
    </div>
  )
}