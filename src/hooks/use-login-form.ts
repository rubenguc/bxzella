import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { m } from '#/paraglide/messages'
import { authClient } from '#/lib/auth-client'

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
    },
    onSubmit: async ({ value }) => {
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
        return {
          form: error.message || error.code || m['auth.sign_in_error'](),
        }
      }

      window.location.href = '/dashboard'
    },
  })

  return form
}
