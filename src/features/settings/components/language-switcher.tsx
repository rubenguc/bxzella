import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeLanguage } from "@/features/settings/server/actions/settings";

const LANGUAGES = ["en", "es"];

export function LanguageSwitcher() {
  const t = useTranslations("settings");
  const locale = useLocale();

  const onChangeLanguage = async (value: string) => {
    await changeLanguage(value);
  };

  return (
    <div className="flex items-center gap-2">
      <label>{t("language")}:</label>
      <Select value={locale} onValueChange={onChangeLanguage}>
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {LANGUAGES.map((lg) => (
              <SelectItem key={lg} value={lg}>
                {t(lg)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
