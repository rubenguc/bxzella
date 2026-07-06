import { useState } from 'react'
import { LogOut } from 'lucide-react'

import { m } from '#/paraglide/messages'
import { authClient } from '#/lib/auth-client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'

export function UserDropdown() {
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { data: session } = authClient.useSession()
  const user = session?.user
  const displayName = user?.name || user?.username
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const confirmLogout = async () => {
    setLogoutOpen(false)
    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer">
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                {initials}
              </div>
              <span>{displayName || 'User'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuLabel>{displayName || 'User'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut />
            <span>{m['header.log_out']()}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{m['header.log_out']()}</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres cerrar sesión?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m['common_messages.cancel']()}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmLogout}>
              {m['header.log_out']()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
