"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { exportTrades } from "../services/trades-services";
import { useUserConfigStore } from "@/store/user-config-store";

interface ExportTradesDialogProps {
  trigger?: React.ReactNode;
}

export function ExportTradesDialog({ trigger }: ExportTradesDialogProps) {
  const t = useTranslations("trades");
  const { selectedAccount, coin } = useUserConfigStore();

  const [open, setOpen] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json">("json");
  const [isExporting, setIsExporting] = useState(false);

  const resetForm = () => {
    setIncludeNotes(false);
    setExportFormat("json");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleExport = async () => {
    if (!selectedAccount?._id) return;

    setIsExporting(true);
    try {
      const blob = await exportTrades({
        accountId: selectedAccount._id,
        coin: coin || "USDT",
        includeNotes,
        format: exportFormat,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trades-${coin || "USDT"}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            {t("export") || "Export"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("export") || "Export"}</DialogTitle>
          <DialogDescription>
            {t("export_description") || "Select the data you want to include and the export format."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <h4 className="font-medium leading-none">
              {t("include") || "Include"}
            </h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-notes"
                checked={includeNotes}
                onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
              />
              <Label htmlFor="include-notes" className="text-sm font-normal cursor-pointer">
                {t("notes") || "Notes"}
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium leading-none">
              {t("export_as") || "Export"}
            </h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="export-json"
                checked={exportFormat === "json"}
                onCheckedChange={() => setExportFormat("json")}
              />
              <Label htmlFor="export-json" className="text-sm font-normal cursor-pointer">
                {t("json") || "JSON"}
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !selectedAccount?._id}>
            {isExporting ? t("exporting") || "Exporting..." : t("export") || "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}