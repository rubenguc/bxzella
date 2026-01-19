import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserConfigStore } from "@/store/user-config-store";

interface ProfileDropdownProps {
  showText: boolean;
}

export function ProfileDropdown({ showText }: ProfileDropdownProps) {
  const t = useTranslations("header");

  const { cleanStore } = useUserConfigStore();

  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    cleanStore();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative rounded-full mx-auto ${!showText && "h-8 w-8"}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} alt="@shadcn" />
            <AvatarFallback>{user?.fullName}</AvatarFallback>
          </Avatar>

          <p
            className={`text-sm leading-none font-medium ${!showText && "hidden"}`}
          >
            {user?.fullName}
          </p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit min-w-40" align="end" forceMount>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">{t("settings")}</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          {t("log_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
