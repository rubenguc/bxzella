import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/theme-context";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: "bxzella",
  description:
    "bxzella is a platform designed to help traders analyze their performance by integrating with the BingX API",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <ClerkProvider>
      <ThemeProvider>
        <html lang={locale}>
          <body>
            <NextIntlClientProvider>
              <Providers>{children}</Providers>
              <Toaster position="top-center" richColors />
            </NextIntlClientProvider>
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
