import { m } from '#/paraglide/messages'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useGetAccounts } from '#/features/exchange-accounts/hooks/use-exchange-accounts'
import { PROVIDER_INFO } from '#/features/exchange-providers/types'
import { useUserConfig } from '#/store/user-config'
import type { AccountItem } from '#/features/exchange-accounts/types'

export function AccountSelector() {
  const { selectedAccount, setSelectedAccount } = useUserConfig()
  const { data: accounts } = useGetAccounts()

  const handleSelect = (value: string) => {
    const account = accounts?.find((a) => a.id === value)
    if (!account) return
    setSelectedAccount(account as AccountItem)
  }

  return (
    <Select
      {...(selectedAccount ? { value: selectedAccount.id } : {})}
      onValueChange={handleSelect}
    >
      <SelectTrigger className="relative min-h-9 min-w-9 py-1 px-2 w-fit rounded-xl flex items-center gap-1 overflow-x-hidden text-nowrap bg-card">
        <SelectValue placeholder={m['accounts.select_account']()}>
          {selectedAccount && (
            <img
              src={PROVIDER_INFO[selectedAccount.provider].image}
              alt={selectedAccount.provider}
              width={20}
              height={20}
              className="rounded-full object-cover shrink-0"
            />
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-1.5">
              <img
                src={PROVIDER_INFO[account.provider].image}
                alt={account.provider}
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
  )
}
