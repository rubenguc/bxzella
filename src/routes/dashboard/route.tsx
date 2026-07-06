import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { AppSidebar } from '#/components/layout/app-sidebar'
import { authClient } from '#/lib/auth-client'
import { checkAdminExists } from '#/lib/server-utils'

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

  const defaultOpen =
    typeof document !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('sidebar_state='))
          ?.split('=')[1] === '1'
      : true

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate({ to: '/login' })
    }
  }, [session, isPending, navigate])

  if (isPending) return null
  if (!session?.user) return null

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger variant="outline" />
          <span className="font-semibold md:text-xl">Dashboard</span>
        </header>
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
