"use client";

import { LanguageSwitcher } from "@/features/settings/components/language-switcher";
import { ThemeSwitcher } from "@/features/settings/components/theme-switcher";
import { useTranslations } from "next-intl";

export default function Settings() {
  const t = useTranslations("settings");

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("settings")}</h2>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </>
  );
}
