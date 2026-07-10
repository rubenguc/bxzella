import { decrypt } from '#/lib/crypto'
import type { ProviderValue } from '#/features/exchange-providers/types'
import type { ProviderInterface } from '#/features/exchange-providers/interface'
import { BingxProvider } from '#/features/exchange-providers/bingx/bingx-provider'
import { BitunixProvider } from '#/features/exchange-providers/bitunix/bitunix-provider'

/**
 * Factory: returns the correct provider instance for the given provider name.
 * Expects plaintext keys — useful during account creation (keys come from the form).
 */
export function getProvider(
  providerName: ProviderValue,
  apiKey: string,
  secretKey: string,
): ProviderInterface {
  const providers: Record<ProviderValue, new (apiKey: string, secretKey: string) => ProviderInterface> = {
    bingx: BingxProvider,
    bitunix: BitunixProvider,
  }

  const Provider = providers[providerName]
  if (!Provider) {
    throw new Error(`Proveedor no soportado: ${providerName}`)
  }

  return new Provider(apiKey, secretKey)
}

/**
 * Convenience: decrypts a DB account record and creates the provider instance.
 */
export function getProviderFromAccount(account: {
  provider: ProviderValue
  apiKey: string
  secretKey: string
}): ProviderInterface {
  return getProvider(account.provider, decrypt(account.apiKey), decrypt(account.secretKey))
}
