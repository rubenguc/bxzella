import { useTranslations } from "next-intl";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/context/theme-context";
import type { Theme } from "@/interfaces/global-interfaces";

const themes: Theme[] = ["light", "dark", "system"];

export function ThemeSwitcher() {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme">{t("theme")}:</label>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger className="w-fit" id="for">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {themes.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {theme}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
