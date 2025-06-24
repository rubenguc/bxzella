import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const supportedLocales = ["en", "es"];
const DEFAULT_LOCALE = "en";

const getBrowserLocale = async () => {
  const _headers = await headers();
  const acceptLanguage = _headers.get("accept-language") || "";
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const code = lang.trim().split(";")[0].toLowerCase();
      if (code.includes("-")) {
        return code.split("-")[0];
      } else {
        return code;
      }
    })
    .filter((lang) => !!lang);

  for (const lang of languages) {
    if (supportedLocales.includes(lang)) {
      return lang;
    }
  }

  return DEFAULT_LOCALE;
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();

  let locale = cookieStore.get("BXZELLA_LOCALE")?.value;

  if (!locale) {
    locale = await getBrowserLocale();
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
