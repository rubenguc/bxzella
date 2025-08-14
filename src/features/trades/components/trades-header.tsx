import { useTranslations } from "next-intl";

export function TradesHeader() {
  const t = useTranslations("trades");

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("header")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
    </div>
  );
}
