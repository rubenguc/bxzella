import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { m } from '#/paraglide/messages'
import { authClient } from '#/lib/auth-client'
import { toAuthErrorMessage } from '#/lib/auth-errors'

const setupSchema = z.object({
  username: z.string().min(3, m['auth.username_min_length']()),
  email: z.string().email(m['auth.email_invalid']()),
  password: z.string().min(8, m['auth.password_min_length']()),
})

export function useSetupForm() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    validators: {
      onChange: setupSchema,
      onMount: setupSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const { error } = await authClient.signUp.email({
        name: value.username,
        email: value.email,
        password: value.password,
        username: value.username,
        ...({ role: 'admin' } as any),
      })

      if (error) {
        formApi.setErrorMap({
          onSubmit: {
            form: toAuthErrorMessage(error as { code?: string; message?: string; status?: number }, m['auth.setup_error']),
            fields: {},
          },
        })
        return
      }

      navigate({ to: '/login' })
    },
  })

  return form
}
