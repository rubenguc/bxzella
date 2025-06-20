import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Theme } from "@/global-interfaces";

const themes: Theme[] = ["light", "dark", "system"];

export function ThemeSwitch() {
  const t = useTranslations("header");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="scale-95 rounded-full">
          <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeItem) => (
          <DropdownMenuItem key={themeItem} onClick={() => setTheme(themeItem)}>
            {t(themeItem)}
            <Check
              size={14}
              className={cn("ml-auto", theme !== themeItem && "hidden")}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
