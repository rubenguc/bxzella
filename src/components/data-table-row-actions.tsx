import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, SquarePen, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

interface DataTableRowActionsProps {
  onDelete?: () => void;
  onEdit?: () => void;
}

export function DataTableRowActions({
  onDelete,
  onEdit,
}: DataTableRowActionsProps) {
  const t = useTranslations("common_messages");

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {onEdit && (
            <DropdownMenuItem
              onClick={() => {
                onEdit();
              }}
            >
              {t("edit")}
              <DropdownMenuShortcut>
                <SquarePen size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {onDelete && (
            <DropdownMenuItem
              onClick={() => {
                onDelete();
              }}
              className="text-red-500!"
            >
              {t("delete")}
              <DropdownMenuShortcut>
                <Trash size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
