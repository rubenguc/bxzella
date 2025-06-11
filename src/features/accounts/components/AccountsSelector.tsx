import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useUserConfigStore } from "@/store/user-config-store";
import { SelectTrigger } from "@radix-ui/react-select";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Wallet } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";

async function fetchAccounts(page: number, limit?: number) {
  const res = await fetch(`/api/accounts?page=${page}&limit=${limit}`);
  return res.json();
}

export function AccountsSelector() {
  const { selectedAccountId, setSelectedAccountId } = useUserConfigStore();

  const { data } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetchAccounts(100),
  });

  const accounts = data?.data || [];

  const handleSelect = (value: string) => {
    setSelectedAccountId(value);
  };

  return (
    <Select value={selectedAccountId} onValueChange={handleSelect}>
      <SelectTrigger className="relative py-1 px-2 w-32 border rounded-lg flex items-center gap-1  overflow-x-hidden text-nowrap">
        <SelectPrimitive.Icon asChild>
          <Wallet className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
        <SelectValue className="" placeholder="Select account" />

        <SelectPrimitive.Icon asChild>
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
