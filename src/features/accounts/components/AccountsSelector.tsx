import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useUserConfigStore } from "@/store/user-config-store";
import { SelectTrigger } from "@radix-ui/react-select";
import { ChevronDown, Wallet } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useTranslations } from "next-intl";
import { useGetAccounts } from "../hooks/useGetAccounts";

export function AccountsSelector() {
  const t = useTranslations("header");
  const { selectedAccountId, setSelectedAccountId } = useUserConfigStore();

  const { data } = useGetAccounts({});

  const accounts = data?.data || [];

  const handleSelect = (value: string) => {
    setSelectedAccountId(value);
  };

  return (
    <Select value={selectedAccountId} onValueChange={handleSelect}>
      <SelectTrigger className="relative min-h-9 py-1 px-2 w-fit md:w-32 border rounded-full flex items-center gap-1  overflow-x-hidden text-nowrap">
        <SelectPrimitive.Icon asChild>
          <Wallet className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
        <SelectValue placeholder={t("account")} />
        <SelectPrimitive.Icon asChild className="hidden md:block">
          <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
        </SelectPrimitive.Icon>
      </SelectTrigger>
      <SelectContent>
        {accounts?.map((account) => (
          <SelectItem key={account._id} value={account._id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
