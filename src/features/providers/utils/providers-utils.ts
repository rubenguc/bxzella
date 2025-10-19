import type { Provider } from "@/interfaces/global-interfaces";
import { BingxProvider } from "../bingx/bingx-api";
import type { ProviderInterface } from "../interfaces/providers-interfaces";
// import { BitunixProvider } from "./bitunix/bitunix-provider";

export const getProvider = (
  providerName: Provider,
  apiKey: string,
  secretKey: string,
): ProviderInterface => {
  switch (providerName) {
    case "bingx":
      return new BingxProvider(apiKey, secretKey);
    // case 'bitunix':
    //   return new BitunixProvider(apiKey, secretKey);
    default:
      throw new Error(`Proveedor no soportado: ${providerName}`);
  }
};
