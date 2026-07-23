import { Link, useLocation } from '@tanstack/react-router'
import { House, BookText, Wallet, Sparkles } from 'lucide-react'

import { m } from '#/paraglide/messages'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'
import { ThemeSwitch } from '#/components/layout/theme-switch'
import { UserDropdown } from '#/components/layout/user-dropdown'

const navItems = [
  { title: m['sidebar.home'](), url: '/dashboard', icon: House, exact: true },
  { title: m['sidebar.accounts'](), url: '/dashboard/exchange-accounts', icon: Wallet },
  { title: m['sidebar.trades'](), url: '/dashboard/trades', icon: BookText },
  { title: m['sidebar.ai_summary'](), url: '/dashboard/ai-summary-subscriptions', icon: Sparkles },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center py-2 group-data-[collapsible=icon]:py-2">
          <img
            src="/logo.png"
            alt="BXZella"
            className="h-8 w-auto group-data-[collapsible=icon]:h-7"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.url
                  : location.pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        activeOptions={item.exact ? { exact: true } : undefined}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <ThemeSwitch />
          <UserDropdown />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
