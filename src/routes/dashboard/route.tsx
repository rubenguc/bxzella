import { createFileRoute, Outlet, redirect, useNavigate, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { AppHeader } from '#/components/layout/app-header'
import { AppSidebar } from '#/components/layout/app-sidebar'
import { authClient } from '#/lib/auth-client'
import { checkAdminExists } from '#/lib/server-utils'
import { m } from '#/paraglide/messages'

const PAGE_TITLES: Record<string, () => string> = {
  '': m['sidebar.home'],
  home: m['sidebar.home'],
  'exchange-accounts': m['sidebar.accounts'],
  trades: m['sidebar.trades'],
  'ai-summary-subscriptions': m['sidebar.ai_summary'],
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const { exists } = await checkAdminExists()
    if (!exists) {
      throw redirect({ to: '/setup' })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const pathname = useLocation().pathname

  const defaultOpen =
    typeof document !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('sidebar_state='))
          ?.split('=')[1] === '1'
      : true

  const pageTitle = PAGE_TITLES[pathname.split('/')[2] ?? 'home']?.() ?? 'Dashboard'

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate({ to: '/login' })
    }
  }, [session, isPending, navigate])

  // Cleanup: Radix sometimes sets aria-hidden on the sidebar-wrapper when collapsing
  // to icon mode, which conflicts with focusable elements in the header (Select triggers).
  // Browser blocks the aria-hidden anyway but this removes the console warning.
  // Also note: Radix Select blocks opening its content when the trigger is inside
  // an aria-hidden ancestor, so removing it is critical for functionality.
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]')
    if (!el) return

    const removeAriaHidden = () => {
      if (el.getAttribute('aria-hidden') !== null) {
        el.removeAttribute('aria-hidden')
      }
    }

    removeAriaHidden()

    const observer = new MutationObserver(removeAriaHidden)
    observer.observe(el, { attributes: true, attributeFilter: ['aria-hidden'] })
    return () => observer.disconnect()
  }, [])

  if (isPending) return null
  if (!session?.user) return null

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader title={pageTitle} />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
