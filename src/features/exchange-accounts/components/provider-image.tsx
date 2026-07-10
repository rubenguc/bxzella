import { PROVIDER_INFO } from '#/features/exchange-providers/types'

export function ProviderImage({ provider }: { provider: string }) {
  const info = PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO]
  if (!info) return null
  return (
    <img
      src={info.image}
      alt={info.label}
      className="h-5 w-5 rounded-full object-cover"
    />
  )
}
