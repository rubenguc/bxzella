import { SidebarTrigger } from '#/components/ui/sidebar'
import { AccountSelector } from '#/components/layout/account-selector'
import { CoinSelector } from '#/components/layout/coin-selector'
import { DateRangeSelector } from '#/components/date-range-selector'

interface AppHeaderProps {
  title?: string
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:gap-4">
      <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
      {title && (
        <span className="font-semibold md:text-xl text-ellipsis overflow-hidden whitespace-nowrap">
          {title}
        </span>
      )}
      <div className="ml-auto flex items-center space-x-4">
        <DateRangeSelector />
        <CoinSelector />
        <AccountSelector />
      </div>
    </header>
  )
}
