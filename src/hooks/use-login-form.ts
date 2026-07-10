import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { m } from '#/paraglide/messages'
import { authClient } from '#/lib/auth-client'
import { toAuthErrorMessage } from '#/lib/auth-errors'

const loginSchema = z.object({
  credential: z.string().min(1, m['auth.credential_required']()),
  password: z.string().min(1, m['auth.password_required']()),
})

export function useLoginForm() {
  const form = useForm({
    defaultValues: {
      credential: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
      onMount: loginSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const signIn = value.credential.includes('@')
        ? authClient.signIn.email({
            email: value.credential,
            password: value.password,
          })
        : authClient.signIn.username({
            username: value.credential,
            password: value.password,
          })

      const { error } = await signIn

      if (error) {
        formApi.setErrorMap({
          onSubmit: {
            form: toAuthErrorMessage(error as { code?: string; message?: string; status?: number }),
            fields: {},
          },
        })
        return
      }

      window.location.href = '/dashboard'
    },
  })

  return form
}
