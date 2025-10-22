import * as SelectPrimitive from "@radix-ui/react-select";
import { SelectTrigger } from "@radix-ui/react-select";
import { ChevronDown, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useGetAccounts } from "@/features/accounts/hooks/useGetAccounts";
import { useUserConfigStore } from "@/store/user-config-store";

export function AccountsSelector() {
  const t = useTranslations("header");
  const { selectedAccount, setSelectedAccount } = useUserConfigStore();

  const { data } = useGetAccounts({});

  const accounts = data?.data || [];

  const handleSelect = (value: string) => {
    const account = accounts.find((account) => account._id === value);
    if (!account) return;

    setSelectedAccount(account);
  };

  return (
    <Select value={selectedAccount?._id} onValueChange={handleSelect}>
      <SelectTrigger className="relative min-h-9 py-1 px-2 w-fit min-w-9 md:w-32  rounded-xl flex items-center gap-1  overflow-x-hidden text-nowrap bg-card outline dark:outline-transparent hover:outline-primary aria-expanded:outline-primary">
        <SelectPrimitive.Icon asChild>
          <Wallet className="h-4 w-4 opacity-50 mx-auto" />
        </SelectPrimitive.Icon>
        <SelectValue placeholder={t("account")} />
        <SelectPrimitive.Icon asChild className="hidden md:block">
          <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
        </SelectPrimitive.Icon>
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account._id} value={account._id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
