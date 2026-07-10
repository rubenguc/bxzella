import { Moon, Sun } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { useTheme } from '#/components/theme-provider'
import { Switch } from '#/components/ui/switch'
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      {/* Collapsed: icon-only button */}
      <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenuButton
          tooltip={theme === 'dark' ? m['header.light']() : m['header.dark']()}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="!size-4 hidden dark:block" />
          <Moon className="!size-4 block dark:hidden" />
        </SidebarMenuButton>
      </SidebarMenuItem>
      {/* Expanded: switch */}
      <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 px-2 py-1">
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            size="sm"
          />
          <Sun className="size-4 hidden dark:block" />
          <Moon className="size-4 block dark:hidden" />
          <span className="text-sm">{m['settings.theme']()}</span>
        </div>
      </SidebarMenuItem>
    </>
  )
}
