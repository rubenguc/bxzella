import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { authClient } from '../lib/auth-client'
import { checkAdminExists } from '../lib/server-utils'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { exists } = await checkAdminExists()
    if (!exists) {
      throw redirect({ to: '/setup' })
    }
  },
  component: Index,
})

function Index() {
  const navigate = useNavigate()

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/login' })
      }
    })
  }, [navigate])

  return null
}
