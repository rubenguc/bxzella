import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAccounts } from "@/features/accounts/hooks/useGetAccounts";
import type { Provider } from "@/interfaces/global-interfaces";
import { useUserConfigStore } from "@/store/user-config-store";
import type { SelectedAccount } from "../interfaces/accounts-interfaces";

const getProviderImage = (provider: Provider) => {
  return `/assets/providers/${provider}.${provider === "bitunix" ? "webp" : "jpeg"}`;
};

const getProviderAltText = (provider: Provider) => {
  return `${provider} exchange logo`;
};

export function AccountsSelector() {
  const t = useTranslations("header");
  const { selectedAccount, setSelectedAccount } = useUserConfigStore();

  const { data } = useGetAccounts({});

  const accounts = data?.data || [];

  const handleSelect = (value: string) => {
    const account = accounts.find((account) => account._id === value);
    if (!account) return;

    setSelectedAccount(account as SelectedAccount);
  };

  return (
    <Select value={selectedAccount?._id} onValueChange={handleSelect}>
      <SelectTrigger className="relative min-h-9 min-w-9 py-1 px-2 w-fit rounded-xl flex items-center gap-1 overflow-x-hidden text-nowrap bg-card">
        <SelectPrimitive.Icon asChild className="block md:hidden mx-auto">
          {selectedAccount && (
            <Image
              src={getProviderImage(selectedAccount.provider)}
              alt={getProviderAltText(selectedAccount.provider)}
              width={20}
              height={20}
              className="rounded-full object-cover"
            />
          )}
        </SelectPrimitive.Icon>
        <SelectValue placeholder={t("account")} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account._id} value={account._id}>
            <div className="flex items-center gap-1.5">
              <Image
                src={getProviderImage(account.provider)}
                alt={getProviderAltText(account.provider)}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
              <span>{account.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
