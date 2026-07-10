import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { importTradesAction } from "#/features/trades/server-actions";
import { useUserConfig } from "#/store/user-config";

export function ImportDialog() {
  const { selectedAccount } = useUserConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async () => {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("no_file");
      if (!selectedAccount) throw new Error("no_account");

      const content = await file.text();

      const result = await importTradesAction({
        data: { fileContent: content, accountId: selectedAccount.id },
      });

      if (!result.success) throw new Error(result.error);

      return result.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Imported ${data.tradesCount} trades, ${data.notebooksCount} notebooks`,
      );
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["daily-pnl"] });
      setOpen(false);
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "import_failed");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-xs">
          <Upload className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import trades</DialogTitle>
          <DialogDescription>
            Upload a JSON file with trades and notebooks to import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file">JSON file</Label>
            <Input
              ref={fileRef}
              id="file"
              type="file"
              accept=".json"
              className="mt-1"
              onChange={(e) => {
                setFileName(e.target.files?.[0]?.name ?? null);
              }}
            />
            {fileName && (
              <p className="mt-1 text-xs text-muted-foreground">{fileName}</p>
            )}
          </div>

          {selectedAccount && (
            <p className="text-sm text-muted-foreground">
              Account: {selectedAccount.name}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => importMutation.mutate()}
            disabled={!fileName || !selectedAccount || importMutation.isPending}
          >
            {importMutation.isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
