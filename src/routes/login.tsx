import { createFileRoute, redirect } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import { useLoginForm } from '#/hooks/use-login-form'
import { checkAdminExists } from '#/lib/server-utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const { exists } = await checkAdminExists()
    if (!exists) {
      throw redirect({ to: '/setup' })
    }
  },
  component: Login,
})

function FieldError({ error }: { error: string | undefined }) {
  if (!error) return null
  return <p className="text-sm text-destructive mt-1">{error}</p>
}

function Login() {
  const form = useLoginForm()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex flex-col items-center gap-2 mb-2">
            <img src="/logo.png" alt="BXZella" width={40} height={40} />
            <span className="text-xl font-bold">BXZella</span>
          </div>
          <CardTitle>{m['auth.sign_in_title']()}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex flex-col gap-4"
          >
            <form.Field
              name="credential"
              children={(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-1 block text-sm font-medium"
                  >
                    {m['auth.email_or_username']()}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="username"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                    placeholder={m['auth.email_placeholder']()}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError
                    error={
                      field.state.meta.isTouched
                        ? field.state.meta.errors.join(', ')
                        : undefined
                    }
                  />
                </div>
              )}
            />

            <form.Field
              name="password"
              children={(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-1 block text-sm font-medium"
                  >
                    {m['auth.password']()}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError
                    error={
                      field.state.meta.isTouched
                        ? field.state.meta.errors.join(', ')
                        : undefined
                    }
                  />
                </div>
              )}
            />

            <form.Subscribe
              selector={(state) => ({
                errors: state.errors,
                isSubmitting: state.isSubmitting,
                canSubmit: state.canSubmit,
              })}
              children={({ errors, isSubmitting, canSubmit }) => (
                <>
                  {errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {errors.join(', ')}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? m['auth.signing_in']() : m['auth.sign_in_button']()}
                  </button>
                </>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
