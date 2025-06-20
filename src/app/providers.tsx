"use client";

import {
  isServer,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

function makeQueryClient() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("errors");

  return new QueryClient({
    queryCache: new QueryCache({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        if (
          err?.status === 500 &&
          err?.response?.data === "incorrect_api_key_error"
        ) {
          toast(t("incorrect_api_key_error"), {
            description: t("incorrect_api_key_error_description"),
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
